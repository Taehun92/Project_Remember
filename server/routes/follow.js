const express = require('express');
const router = express.Router();
const db = require('../db'); // mysql2 pool

/**
 * GET /follow/:userNo/is-following
 * → userNo(userid)가 targetNo(duserid)를 팔로잉 중인지 확인
 */
router.get('/:userNo/is-following', async (req, res) => {
  const followerNo = Number(req.params.userNo);
  const deceasedNo = Number(req.query.targetNo);
  try {
    const [rows] = await db.query(
      `select 1 
       from follow 
       where followerno = ? and followedno = ?`,
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
    const [exists] = await db.query(
      `select 1 from follow where followerno = ? and followedno = ?`,
      [followerNo, deceasedNo]
    );
    if (exists.length > 0) {
      return res.status(409).json({ success: false, message: '이미 팔로우한 대상입니다.' });
    }

    await db.query(
      `insert into follow (followerno, followedno) values (?, ?)`,
      [followerNo, deceasedNo]
    );

    await db.query(
      `insert into user_log 
       (actor_id, target_id, target_type, source_id, source_type, type, summary, isread)
       values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        followerNo,
        deceasedNo,
        'duser',
        deceasedNo,
        'follow',
        'follow',
        '고인을 기억합니다.',
        'N'
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
      `delete from follow where followerno = ? and followedno = ?`,
      [followerNo, deceasedNo]
    );

    if (result.affectedRows > 0) {
      await db.query(
        `delete from user_log 
         where actor_id = ? 
           and target_id = ? 
           and target_type = 'duser' 
           and type = 'follow'`,
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
 * → deceasedNo(duserid)를 팔로잉 중인 user 목록
 */
router.get('/:deceasedNo/followers', async (req, res) => {
  const deceasedNo = Number(req.params.deceasedNo);
  try {
    const [rows] = await db.query(
      `select 
         u.userid, 
         u.username, 
         u.tagname, 
         ui.img_path, 
         ui.img_name,
         f.created_at
       from follow f
       join user u on f.followerno = u.userid
       left join userimg ui on ui.userid = u.userid
       where f.followedno = ?`,
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
 * → userNo(userid)가 팔로우 중인 duser 목록
 */
router.get('/:userNo/following', async (req, res) => {
  const userNo = Number(req.params.userNo);
  try {
    const [rows] = await db.query(
      `select 
         d.duserid, 
         d.dusername, 
         d.relation, 
         d.dbirth, 
         d.death, 
         di.img_path, 
         di.img_name
       from follow f
       join duser d on f.followedno = d.duserid
       left join duserimg di on di.duserid = d.duserid
       where f.followerno = ?`,
      [userNo]
    );
    res.json({ following: rows });
  } catch (err) {
    console.error('❌ Get following error:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
