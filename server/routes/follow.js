const express = require('express');
const router = express.Router();
const db = require('../db'); // mysql2 pool

/**
 * GET /follow/:userNo/is-following
 * → userNo(USERID) 가 targetNo(DUSERID) 를 팔로잉 중인지 확인
 * query: ?targetNo=<duserId>
 */
router.get('/:userNo/is-following', async (req, res) => {
  const followerNo = Number(req.params.userNo);           // USERID
  const deceasedNo = Number(req.query.targetNo);           // DUSERID
  try {
    const [rows] = await db.query(
      `SELECT 1 
         FROM FOLLOW 
        WHERE FOLLOWERNO = ? 
          AND FOLLOWEDNO = ?`,
      [followerNo, deceasedNo]
    );
    res.json({ isFollowing: rows.length > 0 });
  } catch (err) {
    console.error('❌ Check follow error:', err);
    res.status(500).json({ isFollowing: false });
  }
});

// POST /follow/:deceasedNo
router.post('/:deceasedNo', async (req, res) => {
  const followerNo = Number(req.body.followerNo);
  const deceasedNo = Number(req.params.deceasedNo);

  if (!followerNo || !deceasedNo) {
    return res.status(400).json({ success: false, message: '잘못된 요청입니다.' });
  }

  try {
    // 중복 확인
    const [exists] = await db.query(
      `SELECT 1 FROM FOLLOW WHERE FOLLOWERNO = ? AND FOLLOWEDNO = ?`,
      [followerNo, deceasedNo]
    );
    if (exists.length > 0) {
      return res.status(409).json({ success: false, message: '이미 팔로우한 대상입니다.' });
    }

    // FOLLOW 테이블에 추가
    await db.query(
      `INSERT INTO FOLLOW (FOLLOWERNO, FOLLOWEDNO) VALUES (?, ?)`,
      [followerNo, deceasedNo]
    );

    // USER_LOG 테이블에 기록 추가
    await db.query(
      `INSERT INTO USER_LOG (ACTOR_ID, TARGET_ID, TARGET_TYPE, SOURCE_ID, SOURCE_TYPE, TYPE, SUMMARY, ISREAD)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        followerNo,           // ACTOR_ID
        deceasedNo,           // TARGET_ID
        'DUSER',              // TARGET_TYPE
        deceasedNo,
        'FOLLOW',
        'FOLLOW',             // TYPE
        '고인을 기억합니다.', // SUMMARY
        'N'                   // ISREAD
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Follow error:', err);
    res.status(500).json({ success: false, message: 'DB 오류' });
  }
});

// DELETE /follow/:deceasedNo
router.delete('/:deceasedNo', async (req, res) => {
  const followerNo = Number(req.body.followerNo);
  const deceasedNo = Number(req.params.deceasedNo);

  if (!followerNo || !deceasedNo) {
    return res.status(400).json({ success: false, message: '잘못된 요청입니다.' });
  }

  try {
    const [result] = await db.query(
      `DELETE FROM FOLLOW WHERE FOLLOWERNO = ? AND FOLLOWEDNO = ?`,
      [followerNo, deceasedNo]
    );

    // FOLLOW 테이블에서 삭제가 되었을 때만 로그 삭제
    if (result.affectedRows > 0) {
      await db.query(
        `DELETE FROM USER_LOG 
         WHERE ACTOR_ID = ? 
           AND TARGET_ID = ? 
           AND TARGET_TYPE = 'DUSER' 
           AND TYPE = 'FOLLOW'`,
        [followerNo, deceasedNo]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Unfollow error:', err);
    res.status(500).json({ success: false, message: 'DB 오류' });
  }
});


/**
 * GET /follow/:deceasedNo/followers
 * → deceasedNo(DUSERID) 를 팔로잉 중인 USER 목록 (고인 팔로워)
 */
router.get('/:deceasedNo/followers', async (req, res) => {
  const deceasedNo = Number(req.params.deceasedNo);
  try {
    const [rows] = await db.query(
      `SELECT 
         U.USERID, 
         U.USERNAME, 
         U.TAGNAME, 
         UI.IMG_PATH, 
         UI.IMG_NAME,
         F.CREATED_AT
       FROM FOLLOW F
       JOIN USER U       ON F.FOLLOWERNO = U.USERID
       LEFT JOIN USERIMG UI ON UI.USERID   = U.USERID
       WHERE F.FOLLOWEDNO = ?`,
      [deceasedNo]
    );
    res.json({ followers: rows });
  } catch (err) {
    console.error('❌ Get followers error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/**
 * GET /follow/:userNo/following
 * → userNo(USERID) 가 팔로우 중인 DUSER 목록 (내가 팔로우한 고인 리스트)
 */
router.get('/:userNo/following', async (req, res) => {
  const userNo = Number(req.params.userNo);
  try {
    const [rows] = await db.query(
      `SELECT 
         D.DUSERID, 
         D.DUSERNAME, 
         D.RELATION, 
         D.DBIRTH, 
         D.DEATH, 
         DI.IMG_PATH, 
         DI.IMG_NAME
       FROM FOLLOW F
       JOIN DUSER D       ON F.FOLLOWEDNO = D.DUSERID
       LEFT JOIN DUSERIMG DI ON DI.DUSERID   = D.DUSERID
       WHERE F.FOLLOWERNO = ?`,
      [userNo]
    );
    res.json({ following: rows });
  } catch (err) {
    console.error('❌ Get following error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
