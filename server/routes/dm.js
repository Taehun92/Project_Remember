const express = require('express');
const router = express.Router();
const db = require('../db');

// DM 목록 조회
router.get('/list', async (req, res) => {
  const userId = parseInt(req.query.userId);

  const [rows] = await db.execute(`
    SELECT r.*, u.userName, u.tagName, ui.img_path, ui.img_name,
    (
        SELECT contents 
        FROM chat 
        WHERE roomno = r.roomno 
        ORDER BY sent_at DESC 
        LIMIT 1
    ) AS lastMessage
      FROM chatroom r
      JOIN user u 
          ON u.userid = IF(r.user1_id = ?, r.user2_id, r.user1_id)
      LEFT JOIN userimg ui 
          ON ui.userid = u.userid
      WHERE r.user1_id = ? OR r.user2_id = ?
    `, [userId, userId, userId]);

  res.json({ rooms: rows });
});


// DM 방 가져오고, 없으면 생성
router.get('/createOrGetRoom', async (req, res) => {
  const user1 = parseInt(req.query.user1);
  const user2 = parseInt(req.query.user2);

  const userMin = Math.min(user1, user2);
  const userMax = Math.max(user1, user2);

  // 기존 방 조회
  const [exists] = await db.execute(`
    SELECT * FROM chatroom 
    WHERE user_min_id = ? AND user_max_id = ?
  `, [userMin, userMax]);

  if (exists.length > 0) {
    return res.json(exists[0]);
  }

  // 새 방 만들기 (생성 컬럼은 넣지 않음)
  await db.execute(`
    INSERT INTO chatroom (user1_id, user2_id)
    VALUES (?, ?)
  `, [user1, user2]);

  const [newRoom] = await db.execute(`
    SELECT * FROM chatroom 
    WHERE user_min_id = ? AND user_max_id = ?
  `, [userMin, userMax]);

  res.json(newRoom[0]);
});


// 특정 방의 채팅 기록 가져오기
router.get('/history', async (req, res) => {
  const roomno = parseInt(req.query.roomno);

  const [messages] = await db.execute(`
    SELECT * FROM chat 
    WHERE roomno = ?
    ORDER BY sent_at ASC
  `, [roomno]);

  res.json({ messages });
});


// 메세지 전송
router.post('/send', async (req, res) => {
  try {
    const { roomno, sender_id, contents } = req.body;

    await db.execute(`
      INSERT INTO chat (roomno, sender_id, contents)
      VALUES (?, ?, ?)
    `, [roomno, sender_id, contents]);

    res.json({ success: true });
  } catch (err) {
    console.error('🔥 DM 전송 실패:', err);
    res.status(500).json({ error: '메시지 전송 실패' }); // ✅ JSON 에러 응답 보장
  }
});





module.exports = router;