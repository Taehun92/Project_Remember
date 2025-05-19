const express = require('express');
const router = express.Router();
const db = require('../db');

// 1) 전체 피드 목록 조회 (타임라인)
router.get('/list', async (req, res) => {
  const userId = parseInt(req.query.userId); // 로그인 유저
  const size = parseInt(req.query.size) || 10;
  const lastFeedId = parseInt(req.query.lastFeedId);

  try {
    const sql = `
      SELECT F.FEEDNO, F.USERID, F.CONTENTS, F.CREATED_AT,
             U.USERNAME, U.TAGNAME, UI.IMG_PATH, UI.IMG_NAME
      FROM FEEDS F
      JOIN USER U ON F.USERID = U.USERID
      LEFT JOIN USERIMG UI ON U.USERID = UI.USERID
      WHERE F.DELETEYN != 'Y'
        AND F.VISIBILITY = 'PUBLIC'
        AND F.FEEDNO < ?
      ORDER BY F.FEEDNO DESC
      LIMIT ${size}
    `;
    console.log('💬 쿼리 파라미터:', lastFeedId, size);
    console.log('타입 확인:', typeof lastFeedId, typeof size);
    const [rows] = await db.execute(sql, [lastFeedId]);

    const feeds = [];

    for (const feed of rows) {
      const profileImg = feed.IMG_PATH && feed.IMG_NAME
        ? `http://localhost:3005${feed.IMG_PATH}${feed.IMG_NAME}`
        : null;

      // 1. 이미지 목록
      const [imgRows] = await db.execute(
        `SELECT IMGNO, IMG_PATH, IMG_NAME FROM FEEDSIMG WHERE FEEDNO = ?`,
        [feed.FEEDNO]
      );
      const images = imgRows.map(img => ({
        imgNo: img.IMGNO,
        src: `http://localhost:3005${img.IMG_PATH}${img.IMG_NAME}`
      }));

      // 2. 태그 목록
      const [tagRows] = await db.execute(
        `SELECT T.TAGNO, T.TAGNAME 
         FROM FEEDTAG FT
         JOIN TAG T ON FT.TAGNO = T.TAGNO
         WHERE FT.FEEDNO = ?`,
        [feed.FEEDNO]
      );
      const tags = tagRows.map(tag => ({
        tagId: tag.TAGNO,
        name: tag.TAGNAME
      }));

      // 3. 멘션 목록
      const [mentionRows] = await db.execute(
        `SELECT M.MENTIONEDNO, M.MENTIONEDTYPE, 
                U.USERNAME AS USERNAME, D.DUSERNAME AS DNAME
         FROM FMENTIONS M
         LEFT JOIN USER U ON (M.MENTIONEDTYPE = 'USER' AND M.MENTIONEDNO = U.USERID)
         LEFT JOIN DUSER D ON (M.MENTIONEDTYPE = 'DUSER' AND M.MENTIONEDNO = D.DUSERID)
         WHERE M.FEEDNO = ?`,
        [feed.FEEDNO]
      );
      const mentions = mentionRows.map(m => ({
        id: `${m.MENTIONEDTYPE}:${m.MENTIONEDNO}`,
        name: m.USERNAME || m.DNAME
      }));

      // 4. 댓글 수
      const [commentCountRow] = await db.execute(
        `SELECT COUNT(*) AS count FROM COMMENTS WHERE FEEDNO = ?`,
        [feed.FEEDNO]
      );
      const commentCount = commentCountRow[0]?.count || 0;

      // 5. 좋아요 수
      const [likeCountRow] = await db.execute(
        `SELECT COUNT(*) AS count FROM REMEMBER WHERE FEEDNO = ?`,
        [feed.FEEDNO]
      );
      const likeCount = likeCountRow[0]?.count || 0;

      // 6. 내가 좋아요 했는지 여부
      let likedByMe = false;
      if (userId) {
        const [likedRow] = await db.execute(
          `SELECT 1 FROM REMEMBER WHERE FEEDNO = ? AND USERID = ?`,
          [feed.FEEDNO, userId]
        );
        likedByMe = likedRow.length > 0;
      }

      feeds.push({
        feedId: feed.FEEDNO,
        contents: feed.CONTENTS,
        createdAt: feed.CREATED_AT,
        user: {
          userId: feed.USERID,
          userName: feed.USERNAME,
          userTagName: feed.TAGNAME,
          profileImg
        },
        images,
        tags,
        mentions,
        likeCount,
        liked_by_me: likedByMe,
        commentCount
      });
    }

    const hasMore = feeds.length === size;

    res.json({ feeds, hasMore });
  } catch (err) {
    console.error('[전체 피드 목록 조회 실패]', err);
    res.status(500).json({ success: false, message: '전체 피드 조회 실패' });
  }
});


// 전체 피드 조회 (관리용)
router.get('/all', async (req, res) => {
  const [rows] = await db.query(`
    SELECT F.*, U.USERNAME, U.TAGNAME, UI.IMG_PATH, UI.IMG_NAME
    FROM FEEDS F
    JOIN USER U ON F.USERID = U.USERID
    LEFT JOIN USERIMG UI ON UI.USERID = U.USERID
    ORDER BY F.CREATED_AT DESC
  `);
  res.json({ feeds: rows });
});

// 2) 특정 피드 조회 (유저 기준으로 like 상태 포함)
router.get('/:feedNo', async (req, res) => {
  const feedNo = Number(req.params.feedNo);
  const userId = Number(req.query.userId); // 🔑 추가

  const [rows] = await db.query(`SELECT * FROM FEEDS WHERE FEEDNO = ?`, [feedNo]);
  if (!rows.length) return res.status(404).json({ message: '존재하지 않는 피드' });

  const feed = rows[0];

  // 🔹 이미지 조회
  const [imgRows] = await db.query(`
    SELECT IMG_PATH, IMG_NAME
    FROM FEEDSIMG
    WHERE FEEDNO = ?
  `, [feedNo]);

  const images = imgRows.map(img => ({
    src: `http://localhost:3005${img.IMG_PATH}${img.IMG_NAME}`,
    imgName: img.IMG_NAME
  }));

  // 🔹 댓글 조회
  const [commentRows] = await db.query(`
    SELECT C.COMMENTNO as commentId, U.USERNAME as userName, C.CONTENTS as content
    FROM COMMENTS C
    JOIN USER U ON C.USERID = U.USERID
    WHERE C.FEEDNO = ? AND C.DELETEYN = 'N'
    ORDER BY C.CREATED_AT ASC
  `, [feedNo]);

  // 🔹 좋아요 수
  const [likeCountRows] = await db.query(`
    SELECT COUNT(*) as count
    FROM REMEMBER
    WHERE FEEDNO = ?
  `, [feedNo]);
  const likeCount = likeCountRows[0].count;

  // 🔹 좋아요 상태 (로그인 유저 기준)
  let likedByMe = false;
  if (userId) {
    const [likedRows] = await db.query(`
      SELECT * FROM REMEMBER WHERE FEEDNO = ? AND USERID = ?
    `, [feedNo, userId]);
    likedByMe = likedRows.length > 0;
  }

  // 🔹 작성자 정보 (JOIN으로 바로 가져와도 좋지만, 여기선 별도 조회)
  const [userRows] = await db.query(`
    SELECT U.USERID, U.USERNAME, U.TAGNAME, UI.IMG_PATH, UI.IMG_NAME
    FROM USER U
    LEFT JOIN USERIMG UI ON U.USERID = UI.USERID
    WHERE U.USERID = ?
  `, [feed.USERID]);

  const user = userRows.length > 0 ? {
    userId: userRows[0].USERID,
    userName: userRows[0].USERNAME,
    tagName: userRows[0].TAGNAME,
    profileImg: userRows[0].IMG_PATH
      ? `http://localhost:3005${userRows[0].IMG_PATH}${userRows[0].IMG_NAME}`
      : '/default-profile.png'
  } : null;

  // 🔹 멘션 / 태그 (옵션: FEED_MENTIONS, FEED_TAGS 테이블이 있다면 여기에 추가)

  res.json({
    info: {
      feedId: feed.FEEDNO,
      contents: feed.CONTENTS,
      images,
      likeCount,
      liked_by_me: likedByMe,
      user
    },
    comments: commentRows
  });
});

// 4) 피드 수정
router.put('/:feedNo', async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const feedNo = Number(req.params.feedNo);
    const { contents, visibility, mentions, tags, userId } = req.body;

    // 1. 피드 본문 수정
    await conn.query(
      `UPDATE FEEDS SET CONTENTS = ?, VISIBILITY = ?, UPDATED_AT = NOW() WHERE FEEDNO = ?`,
      [contents, visibility, feedNo]
    );

    // 2. 이미지 삭제
    await conn.query(`DELETE FROM FEEDSIMG WHERE FEEDNO = ?`, [feedNo]);

    // 3. 멘션 정리
    await conn.query(`DELETE FROM FMENTIONS WHERE FEEDNO = ?`, [feedNo]);

    for (const mentionId of mentions) {
      const [type, mentionedNo] = mentionId.split(':');
      const mentionedType = type === 'USER' ? 'USER' : 'DUSER';

      await conn.query(
        `INSERT INTO FMENTIONS (FEEDNO, MENTIONERNO, MENTIONEDNO, MENTIONEDTYPE, CREATED_AT)
     VALUES (?, ?, ?, ?, NOW())`,
        [feedNo, userId, mentionedNo, mentionedType]
      );
    }

    // 4. 태그 정리
    await conn.query(`DELETE FROM FEEDTAG WHERE FEEDNO = ?`, [feedNo]);

    for (const tag of tags) {
      // TAG 테이블 존재 여부 확인
      const [[existing]] = await conn.query(`SELECT TAGNO FROM TAG WHERE TAGNAME = ?`, [tag.name]);
      let tagNo = existing?.TAGNO;

      if (!tagNo) {
        const result = await conn.query(`INSERT INTO TAG (TAGNAME) VALUES (?)`, [tag.name]);
        tagNo = result[0].insertId;
      }

      // FEEDTAG 연결
      await conn.query(`INSERT INTO FEEDTAG (FEEDNO, TAGNO) VALUES (?, ?)`, [feedNo, tagNo]);
    }

    // 5. USER_LOG 정리
    await conn.query(`DELETE FROM USER_LOG WHERE TYPE = 'MENTION' AND FEEDNO = ?`, [feedNo]);

    for (const mentionId of mentions) {
      const [targetType, targetId] = mentionId.split(':');

      const summary =
        targetType === 'USER'
          ? '언급되었습니다.'
          : '고인을 언급하였습니다.';

      await conn.query(
        `INSERT INTO USER_LOG
         (ACTOR_ID, FEEDNO, SOURCE_TYPE, SOURCE_ID, TYPE, TARGET_ID, TARGET_TYPE, SUMMARY, ISREAD, CREATED_AT)
         VALUES (?, ?, 'FEED', ?, 'MENTION', ?, ?, ?, 'N', NOW())`,
        [userId, feedNo, feedNo, targetId, targetType, summary]
      );
    }

    await conn.commit();
    conn.release();
    res.json({ success: true, feedId: feedNo });

  } catch (err) {
    console.error('[피드 수정 실패]', err);
    await conn.rollback();
    conn.release();
    res.json({ success: false, message: '피드 수정 중 오류 발생' });
  }
});


// 5) 피드 삭제 // 나중에 관리자에게 요청하여 피드 되 살릴 수 있게 soft delete 처리
router.delete('/:feedId', async (req, res) => {
  const feedId = parseInt(req.params.feedId, 10);
  console.log("삭제용 feedNO", feedId);

  try {
    await db.execute(
      `UPDATE FEEDS SET DELETEYN = 'Y', UPDATED_AT = NOW() WHERE FEEDNO = ?`,
      [feedId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('피드 삭제 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// ✅ 피드 등록 + 로그 처리 전반
router.post('/create', async (req, res) => {
  const { contents, mentions = [], tags = [], userId } = req.body;

  console.log("req.body", req.body);


  try {
    // 1. 피드 저장
    const [feedResult] = await db.execute(
      `INSERT INTO FEEDS (USERID, CONTENTS, CREATED_AT) VALUES (?, ?, NOW())`,
      [userId, contents]
    );
    const feedId = feedResult.insertId;

    // 2. 태그 저장 처리
    for (const tag of tags) {
      let tagId;

      if (tag.isNew) {
        const [exists] = await db.execute(`SELECT TAGNO FROM TAG WHERE TAGNAME = ?`, [tag.name]);
        if (exists.length > 0) {
          tagId = exists[0].TAGNO;
        } else {
          const [insertResult] = await db.execute(`INSERT INTO TAG (TAGNAME) VALUES (?)`, [tag.name]);
          tagId = insertResult.insertId;
        }
      } else {
        const rawId = tag.id;
        const numericId = rawId.includes(':') ? rawId.split(':')[1] : rawId;
        const [rows] = await db.execute(`SELECT TAGNO FROM TAG WHERE TAGNO = ?`, [numericId]);
        if (rows.length === 0) continue;
        tagId = rows[0].TAGNO;
      }

      await db.execute(`INSERT INTO FEEDTAG (FEEDNO, TAGNO) VALUES (?, ?)`, [feedId, tagId]);
    }

    // 3. 멘션 저장 및 USER_LOG 대상 구성
    const seenMentions = new Set();
    const logTargets = new Map();

    for (const uid of mentions) {
      if (!uid.includes(':')) continue;
      const [type, id] = uid.split(':');
      const key = `${type}:${id}`;
      if (seenMentions.has(key)) continue;
      seenMentions.add(key);

      await db.execute(
        `INSERT INTO FMENTIONS (FEEDNO, MENTIONERNO, MENTIONEDNO, MENTIONEDTYPE, CREATED_AT)
         VALUES (?, ?, ?, ?, NOW())`,
        [feedId, userId, id, type]
      );

      logTargets.set(`${type}:${id}`, {
        actorId: userId,
        feedId,
        sourceType: 'FEED',
        sourceId: feedId,
        type: 'MENTION',
        targetId: id,
        targetType: type,
        summary: type === 'DUSER' ? '고인을 언급하였습니다.' : '언급되었습니다.'
      });
    }

    // 4. 작성자 본인 로그
    logTargets.set(`FEED:${userId}`, {
      actorId: userId,
      feedId,
      sourceType: 'FEED',
      sourceId: feedId,
      type: 'FEED',
      targetId: userId,
      targetType: 'USER',
      summary: ' 피드를 작성했습니다.'
    });

    // 5. 로그 저장
    for (const log of logTargets.values()) {
      await db.execute(
        `INSERT INTO USER_LOG
         (ACTOR_ID, FEEDNO, SOURCE_TYPE, SOURCE_ID, TYPE, TARGET_ID, TARGET_TYPE, SUMMARY, ISREAD, CREATED_AT)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'N', NOW())`,
        [
          log.actorId,
          log.feedId,
          log.sourceType,
          log.sourceId,
          log.type,
          log.targetId,
          log.targetType,
          log.summary
        ]
      );
    }

    res.json({ success: true, feedId });
  } catch (err) {
    console.error('[Feed 생성 실패]', err);
    res.status(500).json({ success: false, message: '피드 저장 실패' });
  }
});


// 좋아요
router.post('/:feedNo/remember', async (req, res) => {
  const feedNo = parseInt(req.params.feedNo, 10);
  const userId = req.body.userId;

  try {
    // 피드 주인 정보 조회
    const [feedRow] = await db.execute(`
      SELECT USERID FROM FEEDS WHERE FEEDNO = ?
    `, [feedNo]);

    const targetUserId = feedRow[0]?.USERID;

    // 좋아요 등록
    await db.execute(`
      INSERT IGNORE INTO REMEMBER (FEEDNO, USERID, CREATED_AT)
      VALUES (?, ?, NOW())
    `, [feedNo, userId]);

    // 로그 기록
    await db.execute(`
      INSERT INTO USER_LOG (
        FEEDNO, ACTOR_ID, TARGET_ID, TARGET_TYPE, TYPE,
        SOURCE_ID, SOURCE_TYPE, SUMMARY, ISREAD, CREATED_AT
      ) VALUES (?, ?, ?, 'USER', 'LIKE', ?, 'FEED', ?, 'N', NOW())
    `, [
      feedNo,
      userId,
      targetUserId,
      feedNo,
      '회원님의 게시글을 기억합니다'
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error('기억해요 등록 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 좋아요 취소
router.delete('/:feedNo/remember', async (req, res) => {
  const feedNo = parseInt(req.params.feedNo, 10);
  const userId = req.body.userId;

  try {
    // 좋아요 취소
    await db.execute(`
      DELETE FROM REMEMBER
      WHERE FEEDNO = ? AND USERID = ?
    `, [feedNo, userId]);

    // 로그 삭제 (ACTOR_ID + FEEDNO 기준)
    await db.execute(`
      DELETE FROM USER_LOG
      WHERE FEEDNO = ? AND ACTOR_ID = ? AND TYPE = 'LIKE'
    `, [feedNo, userId]);

    res.json({ success: true });
  } catch (err) {
    console.error('기억해요 취소 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});








module.exports = router;
