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
      SELECT d.*, di.img_path, di.img_name
      FROM duser d
      LEFT JOIN duserimg di ON di.duserid = d.duserid
      WHERE d.duserid = ?
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
      SELECT u.userid, u.username, u.tagname, ui.img_path, ui.img_name, f.created_at
      FROM follow f
      JOIN user u ON f.followerno = u.userid
      LEFT JOIN userimg ui ON ui.userid = u.userid
      WHERE f.followedno = ?
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
      SELECT t.timelinno, t.type, t.created_at, d.dusername
      FROM dtimeline t
      JOIN duser d ON t.duserid = d.duserid
      WHERE t.duserid = ?
      ORDER BY t.created_at DESC
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
      SELECT 'feed' AS type, f.contents, f.created_at, f.feedno AS itemNo
      FROM feeds f
      JOIN fmentions fm ON fm.feedno = f.feedno
      WHERE fm.mentionedno = ?

      UNION ALL

      SELECT 'comment' AS type, c.contents, c.created_at, c.commentno AS itemNo
      FROM comments c
      JOIN cmentions cm ON cm.commentno = c.commentno
      WHERE cm.mentionedno = ?

      ORDER BY created_at DESC
    `, [duserId, duserId]);
    res.json({ mentions: rows });
  } catch (err) {
    console.error('❌ [deceased/:id/mentions] error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 고인 정보 업데이트
router.put('/update', async (req, res) => {
  const { duserid, dusername, dbirth, death, gender, relation, rest_place, contents, linked_url, visibility } = req.body;
  try {
    await db.query(`
      UPDATE duser
      SET dusername = ?, dbirth = ?, death = ?, gender = ?, relation = ?, rest_place = ?, contents = ?, linked_url = ?, visibility = ?, updated_at = NOW()
      WHERE duserid = ?
    `, [dusername, dbirth, death, gender, relation, rest_place, contents, linked_url, visibility, duserid]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ /deceased/update error:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;
