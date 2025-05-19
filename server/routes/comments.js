const express = require('express');
const router = express.Router();
const db = require('../db');

// 댓글 저장
router.post('/:feedNo', async (req, res) => {
    const feedNo = parseInt(req.params.feedNo, 10);
    const { userId, contents, parentCommentNo = null, mentions = [] } = req.body;

    const connection = await db.getConnection();

    console.log('📥 댓글 저장 요청');
    console.log('feedNo:', feedNo);
    console.log('userId:', userId);
    console.log('contents:', contents);
    console.log('parentCommentNo:', parentCommentNo);
    console.log('mentions:', mentions); // ✅ 멘션 확인

    try {
        await connection.beginTransaction();

        // 1. 댓글 저장
        const [result] = await connection.execute(`
            INSERT INTO COMMENTS (FEEDNO, USERID, CONTENTS, PARENT_COMMENTNO, DELETEYN, CREATED_AT, UPDATED_AT)
            VALUES (?, ?, ?, ?, 'N', NOW(), NOW())
        `, [feedNo, userId, contents, parentCommentNo]);

        const commentNo = result.insertId;

        // 2. 피드 활동 기록 - 댓글 등록
        await connection.execute(`
        INSERT INTO USER_LOG 
        (FEEDNO, ACTOR_ID, TARGET_TYPE, TYPE, SOURCE_ID, SOURCE_TYPE, SUMMARY, ISREAD, CREATED_AT)
        VALUES (?, ?, 'USER', 'COMMENT', ?, 'COMMENT', ?, 'N', NOW())
        `, [feedNo, userId, commentNo, '새로운 댓글이 등록되었습니다']);

        // 3. 멘션 저장 + 활동 기록
        for (const rawId of mentions) {
            let mentionedNo, type;

            if (typeof rawId === 'string' && rawId.includes(':')) {
                [type, mentionedNo] = rawId.split(':');
            } else if (typeof rawId === 'object' && rawId.id && rawId.id.includes(':')) {
                [type, mentionedNo] = rawId.id.split(':');
            } else {
                continue; // 잘못된 형식이면 skip
            }

            const isDuser = type === 'DUSER';
            const summary = isDuser
                ? '고인을 언급하였습니다.'
                : '언급되었습니다.';

            await connection.execute(`
                 INSERT INTO CMENTIONS (COMMENTNO, MENTIONERNO, MENTIONEDNO, MENTIONEDTYPE, CREATED_AT)
                 VALUES (?, ?, ?, ?, NOW())
                `, [commentNo, userId, mentionedNo, type]);

            await connection.execute(`
             INSERT INTO USER_LOG 
             (FEEDNO, ACTOR_ID, TARGET_ID, TARGET_TYPE, TYPE, SOURCE_ID, SOURCE_TYPE, SUMMARY, ISREAD, CREATED_AT)
             VALUES (?, ?, ?, ?, 'MENTION', ?, 'COMMENT', ?, 'N', NOW())
            `, [
                feedNo,
                userId,
                mentionedNo,
                isDuser ? 'DUSER' : 'USER',
                commentNo,
                summary
            ]);
        }

        await connection.commit();
        res.json({ success: true, commentNo });

    } catch (err) {
        await connection.rollback();
        console.error('댓글 등록 실패:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        connection.release();
    }
});


// 댓글 수정
router.put('/:commentNo', async (req, res) => {
    const commentNo = parseInt(req.params.commentNo, 10);
    const { userId, feedNo, contents, mentions = [] } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. 댓글 수정
        const [updateResult] = await connection.execute(`
            UPDATE COMMENTS
            SET CONTENTS = ?, UPDATED_AT = NOW()
            WHERE COMMENTNO = ? AND USERID = ? AND DELETEYN = 'N'
        `, [contents, commentNo, userId]);

        if (updateResult.affectedRows === 0) {
            throw new Error('댓글이 없거나 권한이 없습니다.');
        }

        // 2. 기존 멘션 목록 조회
        const [oldMentions] = await connection.execute(`
            SELECT MENTIONEDNO FROM CMENTIONS
            WHERE COMMENTNO = ?
        `, [commentNo]);

        const oldMentionSet = new Set(oldMentions.map(m => m.MENTIONEDNO));
        const newMentionSet = new Set(mentions);

        const added = [...newMentionSet].filter(uid => !oldMentionSet.has(uid));
        const removed = [...oldMentionSet].filter(uid => !newMentionSet.has(uid));

        // 3. 추가된 멘션 → INSERT
        for (const rawId of added) {
            if (typeof rawId !== 'string' || !rawId.includes(':')) continue;

            const [type, mentionedNo] = rawId.split(':');
            const isDuser = type === 'DUSER';
            const summary = isDuser
                ? '고인을 언급하였습니다.'
                : '언급되었습니다.';

            await connection.execute(`
                INSERT INTO CMENTIONS (COMMENTNO, MENTIONERNO, MENTIONEDNO, MENTIONEDTYPE, CREATED_AT)
                VALUES (?, ?, ?, ?, NOW())
            `, [commentNo, userId, mentionedNo, type]);

            await connection.execute(`
            INSERT INTO USER_LOG 
            (FEEDNO, ACTOR_ID, TARGET_ID, TARGET_TYPE, TYPE, SOURCE_ID, SOURCE_TYPE, SUMMARY, ISREAD, CREATED_AT)
             VALUES (?, ?, ?, ?, 'MENTION', ?, 'COMMENT', ?, 'N', NOW())
            `, [
                feedNo,
                userId,
                mentionedNo,
                isDuser ? 'DUSER' : 'USER',
                commentNo,
                summary
            ]);
        }


        // 4. 삭제된 멘션 → DELETE
        for (const mentionedNo of removed) {
            await connection.execute(`
                DELETE FROM CMENTIONS
                WHERE COMMENTNO = ? AND MENTIONEDNO = ?
            `, [commentNo, mentionedNo]);

            await connection.execute(`
            DELETE FROM USER_LOG
            WHERE TYPE = 'MENTION'
            AND SOURCE_TYPE = 'COMMENT'
            AND SOURCE_ID = ?
            AND TARGET_ID = ?
            `, [commentNo, mentionedNo]);
        }

        await connection.commit();
        res.json({ success: true });

    } catch (err) {
        await connection.rollback();
        console.error('댓글 수정 실패:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        connection.release();
    }
});


// 댓글 삭제
router.delete('/:commentNo', async (req, res) => {
    const commentNo = parseInt(req.params.commentNo, 10);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. 대댓글 목록 조회
        const [childComments] = await connection.execute(`
            SELECT COMMENTNO FROM COMMENTS
            WHERE PARENT_COMMENTNO = ?
        `, [commentNo]);

        const childCommentNos = childComments.map(row => row.COMMENTNO);

        // 2. 멘션 삭제 (자식 포함)
        const allCommentNos = [commentNo, ...childCommentNos];

        if (allCommentNos.length > 0) {
            await connection.query(`
                DELETE FROM CMENTIONS
                WHERE COMMENTNO IN (${allCommentNos.map(() => '?').join(',')})
            `, allCommentNos);

            // 3. USERLOG 삭제
            await connection.query(`
                DELETE FROM USER_LOG
                WHERE SOURCE_ID IN (${allCommentNos.map(() => '?').join(',')})
                AND SOURCE_TYPE = 'COMMENT'
            `, allCommentNos);
        }

        // 4. 자식 댓글 삭제
        if (childCommentNos.length > 0) {
            await connection.query(`
                DELETE FROM COMMENTS
                WHERE COMMENTNO IN (${childCommentNos.map(() => '?').join(',')})
            `, childCommentNos);
        }

        // 5. 원본 댓글 삭제
        await connection.execute(`
            DELETE FROM COMMENTS
            WHERE COMMENTNO = ?
        `, [commentNo]);

        await connection.commit();
        res.json({ success: true });

    } catch (err) {
        await connection.rollback();
        console.error('댓글 삭제 실패:', err);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        connection.release();
    }
});

// 댓글 전체 조회 (including count)
router.get('/:feedNo', async (req, res) => {
    const feedNo = parseInt(req.params.feedNo, 10);
    console.log("댓글 조회 feedNo", feedNo);

    try {
        // 전체 댓글 수 조회
        const [[{ totalCount }]] = await db.query(
            `SELECT COUNT(*) AS totalCount FROM COMMENTS WHERE FEEDNO = ?`,
            [feedNo]
        );

        // 댓글 목록 조회
        const [rows] = await db.query(`
      SELECT 
        C.COMMENTNO,
        C.FEEDNO,
        C.USERID,
        C.CONTENTS,
        C.PARENT_COMMENTNO,
        C.CREATED_AT,
        C.DELETEYN,
        U.TAGNAME,
        U.USERNAME,
        U.USERID,
        UI.IMG_PATH,
        UI.IMG_NAME
      FROM COMMENTS C
      JOIN USER U ON C.USERID = U.USERID
      JOIN USERIMG UI ON U.USERID = UI.USERID
      WHERE C.FEEDNO = ?
      ORDER BY C.CREATED_AT ASC
    `, [feedNo]);

        const parents = [];
        const childrenMap = {};

        for (const row of rows) {
            const comment = {
                commentNo: row.COMMENTNO,
                contents: row.DELETEYN === 'Y' ? '삭제된 댓글입니다.' : row.CONTENTS,
                createdAt: row.CREATED_AT,
                parents: row.PARENT_COMMENTNO,
                user: {
                    userId: row.USERID,
                    tagname: row.TAGNAME,
                    name: row.USERNAME,
                    img: row.IMG_PATH && row.IMG_NAME
                        ? `http://localhost:3005${row.IMG_PATH}${row.IMG_NAME}`
                        : '/default-profile.png'
                },
                children: []
            };

            if (row.PARENT_COMMENTNO === null) {
                parents.push(comment);
            } else {
                if (!childrenMap[row.PARENT_COMMENTNO]) {
                    childrenMap[row.PARENT_COMMENTNO] = [];
                }
                childrenMap[row.PARENT_COMMENTNO].push(comment);
            }
        }

        for (const parent of parents) {
            parent.children = childrenMap[parent.commentNo] || [];
        }

        res.json({ list: parents, totalCount });

    } catch (err) {
        console.error('댓글 조회 실패:', err);
        res.status(500).json({ error: '서버 오류' });
    }
});

module.exports = router;