const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * 1) [GET] /deceased/:id/info
 *    → 고인 기본 정보만 조회
 */
router.get('/:id/info', async (req, res) => {
  const duserId = Number(req.params.id);
  try {
    const [rows] = await db.query(`
      SELECT D.*, DI.IMG_PATH, DI.IMG_NAME
      FROM DUSER D
      LEFT JOIN DUSERIMG DI ON DI.DUSERID = D.DUSERID
      WHERE D.DUSERID = ?
    `, [duserId]);
    res.json({ deceased: rows[0] || null });
  } catch (err) {
    console.error('❌ [deceased/:id/info] error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/**
 * 2) [GET] /deceased/:id/followers
 *    → 고인의 팔로워 목록 조회
 */
router.get('/:id/followers', async (req, res) => {
  const duserId = Number(req.params.id);
  try {
    const [rows] = await db.query(`
      SELECT U.USERID, U.USERNAME, U.TAGNAME, UI.IMG_PATH, UI.IMG_NAME, F.CREATED_AT
      FROM FOLLOW F
      JOIN USER U      ON F.FOLLOWERNO = U.USERID
      LEFT JOIN USERIMG UI ON UI.USERID   = U.USERID
      WHERE F.FOLLOWEDNO = ?
    `, [duserId]);
    res.json({ followers: rows });
  } catch (err) {
    console.error('❌ [deceased/:id/followers] error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/**
 * 3) [GET] /deceased/:id/timeline
 *    → 고인 타임라인 조회
 */
router.get('/:id/timeline', async (req, res) => {
  const duserId = Number(req.params.id);
  try {
    const [rows] = await db.query(`
      SELECT T.TIMELINENO, T.TYPE, T.CREATED_AT, D.DUSERNAME
      FROM DTIMELINE T
      JOIN DUSER D ON T.DUSERID = D.DUSERID
      WHERE T.DUSERID = ?
      ORDER BY T.CREATED_AT DESC
    `, [duserId]);
    res.json({ timeline: rows });
  } catch (err) {
    console.error('❌ [deceased/:id/timeline] error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/**
 * 4) [GET] /deceased/:id/mentions
 *    → 고인 언급(멘션)된 피드 & 댓글 조회
 */
router.get('/:id/mentions', async (req, res) => {
  const duserId = Number(req.params.id);
  try {
    const [rows] = await db.query(`
      SELECT 'FEED'    AS TYPE, F.CONTENTS, F.CREATED_AT, F.FEEDNO AS itemNo
      FROM FEEDS F
      JOIN FMENTIONS FM ON FM.FEEDNO      = F.FEEDNO
      WHERE FM.MENTIONEDNO = ?

      UNION ALL

      SELECT 'COMMENT' AS TYPE, C.CONTENTS, C.CREATED_AT, C.COMMENTNO AS itemNo
      FROM COMMENTS C
      JOIN CMENTIONS CM ON CM.COMMENTNO   = C.COMMENTNO
      WHERE CM.MENTIONEDNO = ?

      ORDER BY CREATED_AT DESC
    `, [duserId, duserId]);
    res.json({ mentions: rows });
  } catch (err) {
    console.error('❌ [deceased/:id/mentions] error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 고인 정보 업데이트
router.put('/update', async (req, res) => {
  const { DUSERID, DUSERNAME, DBIRTH, DEATH, GENDER, RELATION, REST_PLACE, CONTENTS, LINKED_URL, VISIBILITY } = req.body;
  try {
    await db.query(`UPDATE DUSER SET DUSERNAME = ?, DBIRTH = ?, DEATH = ?, GENDER = ?, RELATION = ?, REST_PLACE = ?, CONTENTS = ?, LINKED_URL = ?, VISIBILITY = ?, UPDATED_AT = NOW() WHERE DUSERID = ?`,
      [DUSERNAME, DBIRTH, DEATH, GENDER, RELATION, REST_PLACE, CONTENTS, LINKED_URL, VISIBILITY, DUSERID]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ /deceased/update error:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});




module.exports = router;