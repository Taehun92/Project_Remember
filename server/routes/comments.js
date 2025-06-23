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
    console.log('mentions:', mentions);

    try {
        await connection.beginTransaction();

        // 1. 댓글 저장
        const [result] = await connection.execute(`
            insert into comments (feedno, userid, contents, parent_commentno, deleteyn, created_at, updated_at)
            values (?, ?, ?, ?, 'N', now(), now())
        `, [feedNo, userId, contents, parentCommentNo]);

        const commentNo = result.insertId;

        // 2. 피드 활동 기록
        await connection.execute(`
            insert into user_log 
            (feedno, actor_id, target_type, type, source_id, source_type, summary, isread, created_at)
            values (?, ?, 'USER', 'COMMENT', ?, 'COMMENT', ?, 'N', now())
        `, [feedNo, userId, commentNo, '새로운 댓글이 등록되었습니다']);

        // 3. 멘션 저장
        for (const rawId of mentions) {
            let mentionedNo, type;

            if (typeof rawId === 'string' && rawId.includes(':')) {
                [type, mentionedNo] = rawId.split(':');
            } else if (typeof rawId === 'object' && rawId.id && rawId.id.includes(':')) {
                [type, mentionedNo] = rawId.id.split(':');
            } else {
                continue;
            }

            const isDuser = type === 'DUSER';
            const summary = isDuser
                ? '고인을 언급하였습니다.'
                : '언급되었습니다.';

            await connection.execute(`
                insert into cmentions (commentno, mentionerno, mentionedno, mentionedtype, created_at)
                values (?, ?, ?, ?, now())
            `, [commentNo, userId, mentionedNo, type]);

            await connection.execute(`
                insert into user_log 
                (feedno, actor_id, target_id, target_type, type, source_id, source_type, summary, isread, created_at)
                values (?, ?, ?, ?, 'MENTION', ?, 'COMMENT', ?, 'N', now())
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

        const [updateResult] = await connection.execute(`
            update comments
            set contents = ?, updated_at = now()
            where commentno = ? and userid = ? and deleteyn = 'N'
        `, [contents, commentNo, userId]);

        if (updateResult.affectedRows === 0) {
            throw new Error('댓글이 없거나 권한이 없습니다.');
        }

        const [oldMentions] = await connection.execute(`
            select mentionedno from cmentions
            where commentno = ?
        `, [commentNo]);

        const oldMentionSet = new Set(oldMentions.map(m => m.mentionedno));
        const newMentionSet = new Set(mentions);

        const added = [...newMentionSet].filter(uid => !oldMentionSet.has(uid));
        const removed = [...oldMentionSet].filter(uid => !newMentionSet.has(uid));

        for (const rawId of added) {
            if (typeof rawId !== 'string' || !rawId.includes(':')) continue;

            const [type, mentionedNo] = rawId.split(':');
            const isDuser = type === 'DUSER';
            const summary = isDuser
                ? '고인을 언급하였습니다.'
                : '언급되었습니다.';

            await connection.execute(`
                insert into cmentions (commentno, mentionerno, mentionedno, mentionedtype, created_at)
                values (?, ?, ?, ?, now())
            `, [commentNo, userId, mentionedNo, type]);

            await connection.execute(`
                insert into user_log 
                (feedno, actor_id, target_id, target_type, type, source_id, source_type, summary, isread, created_at)
                values (?, ?, ?, ?, 'MENTION', ?, 'COMMENT', ?, 'N', now())
            `, [
                feedNo,
                userId,
                mentionedNo,
                isDuser ? 'DUSER' : 'USER',
                commentNo,
                summary
            ]);
        }

        for (const mentionedNo of removed) {
            await connection.execute(`
                delete from cmentions
                where commentno = ? and mentionedno = ?
            `, [commentNo, mentionedNo]);

            await connection.execute(`
                delete from user_log
                where type = 'MENTION'
                and source_type = 'COMMENT'
                and source_id = ?
                and target_id = ?
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

        const [childComments] = await connection.execute(`
            select commentno from comments
            where parent_commentno = ?
        `, [commentNo]);

        const childCommentNos = childComments.map(row => row.commentno);
        const allCommentNos = [commentNo, ...childCommentNos];

        if (allCommentNos.length > 0) {
            await connection.query(`
                delete from cmentions
                where commentno in (${allCommentNos.map(() => '?').join(',')})
            `, allCommentNos);

            await connection.query(`
                delete from user_log
                where source_id in (${allCommentNos.map(() => '?').join(',')})
                and source_type = 'COMMENT'
            `, allCommentNos);
        }

        if (childCommentNos.length > 0) {
            await connection.query(`
                delete from comments
                where commentno in (${childCommentNos.map(() => '?').join(',')})
            `, childCommentNos);
        }

        await connection.execute(`
            delete from comments
            where commentno = ?
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

// 댓글 전체 조회
router.get('/:feedNo', async (req, res) => {
    const feedNo = parseInt(req.params.feedNo, 10);
    console.log("댓글 조회 feedNo", feedNo);

    try {
        const [[{ totalCount }]] = await db.query(
            `select count(*) as totalCount from comments where feedno = ?`,
            [feedNo]
        );

        const [rows] = await db.query(`
            select 
                c.commentno,
                c.feedno,
                c.userid,
                c.contents,
                c.parent_commentno,
                c.created_at,
                c.deleteyn,
                u.tagname,
                u.username,
                u.userid,
                ui.img_path,
                ui.img_name
            from comments c
            join user u on c.userid = u.userid
            join userimg ui on u.userid = ui.userid
            where c.feedno = ?
            order by c.created_at asc
        `, [feedNo]);

        const parents = [];
        const childrenMap = {};

        for (const row of rows) {
            const comment = {
                commentNo: row.commentno,
                contents: row.deleteyn === 'Y' ? '삭제된 댓글입니다.' : row.contents,
                createdAt: row.created_at,
                parents: row.parent_commentno,
                user: {
                    userId: row.userid,
                    tagName: row.tagname,
                    name: row.username,
                    img: row.img_path && row.img_name
                        ? `http://localhost:3005${row.img_path}${row.img_name}`
                        : '/default-profile.png'
                },
                children: []
            };

            if (row.parent_commentno === null) {
                parents.push(comment);
            } else {
                if (!childrenMap[row.parent_commentno]) {
                    childrenMap[row.parent_commentno] = [];
                }
                childrenMap[row.parent_commentno].push(comment);
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
