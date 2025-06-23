const express = require('express');
const router = express.Router();
const db = require('../db');

// 1) 전체 피드 목록 조회 (타임라인)
router.get('/list', async (req, res) => {
  const userId = parseInt(req.query.userId);
  const size = parseInt(req.query.size) || 10;
  const lastFeedId = parseInt(req.query.lastFeedId);

  try {
    const sql = `
      select f.feedno, f.userid, f.contents, f.created_at,
             u.username, u.tagname, ui.img_path, ui.img_name
      from feeds f
      join user u on f.userid = u.userid
      left join userimg ui on u.userid = ui.userid
      where f.deleteyn != 'Y'
        and f.visibility = 'PUBLIC'
        and f.feedno < ?
      order by f.feedno desc
      limit ${size}
    `;
    const [rows] = await db.execute(sql, [lastFeedId]);

    const feeds = [];

    for (const feed of rows) {
      const profileImg = feed.img_path && feed.img_name
        ? `http://localhost:3005${feed.img_path}${feed.img_name}`
        : null;

      const [imgRows] = await db.execute(
        `select imgno, img_path, img_name from feedsimg where feedno = ?`,
        [feed.feedno]
      );
      const images = imgRows.map(img => ({
        imgNo: img.imgno,
        src: `http://localhost:3005${img.img_path}${img.img_name}`
      }));

      const [tagRows] = await db.execute(
        `select t.tagno, t.tagname 
         from feedtag ft
         join tag t on ft.tagno = t.tagno
         where ft.feedno = ?`,
        [feed.feedno]
      );
      const tags = tagRows.map(tag => ({
        tagId: tag.tagno,
        name: tag.tagname
      }));

      const [mentionRows] = await db.execute(
        `select m.mentionedno, m.mentionedtype, 
                u.username as username, d.dusername as dname
         from fmentions m
         left join user u on (m.mentionedtype = 'user' and m.mentionedno = u.userid)
         left join duser d on (m.mentionedtype = 'duser' and m.mentionedno = d.duserid)
         where m.feedno = ?`,
        [feed.feedno]
      );
      const mentions = mentionRows.map(m => ({
        id: `${m.mentionedtype}:${m.mentionedno}`,
        name: m.username || m.dname
      }));

      const [commentCountRow] = await db.execute(
        `select count(*) as count from comments where feedno = ?`,
        [feed.feedno]
      );
      const commentCount = commentCountRow[0]?.count || 0;

      const [likeCountRow] = await db.execute(
        `select count(*) as count from remember where feedno = ?`,
        [feed.feedno]
      );
      const likeCount = likeCountRow[0]?.count || 0;

      let likedByMe = false;
      if (userId) {
        const [likedRow] = await db.execute(
          `select 1 from remember where feedno = ? and userid = ?`,
          [feed.feedno, userId]
        );
        likedByMe = likedRow.length > 0;
      }

      feeds.push({
        feedId: feed.feedno,
        contents: feed.contents,
        createdAt: feed.created_at,
        user: {
          userId: feed.userid,
          userName: feed.username,
          userTagName: feed.tagname,
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
    select f.*, u.username, u.tagname, ui.img_path, ui.img_name
    from feeds f
    join user u on f.userid = u.userid
    left join userimg ui on ui.userid = u.userid
    order by f.created_at desc
  `);
  res.json({ feeds: rows });
});

// 2) 특정 피드 조회
router.get('/:feedNo', async (req, res) => {
  const feedNo = Number(req.params.feedNo);
  const userId = Number(req.query.userId);

  const [rows] = await db.query(`select * from feeds where feedno = ?`, [feedNo]);
  if (!rows.length) return res.status(404).json({ message: '존재하지 않는 피드' });

  const feed = rows[0];

  const [imgRows] = await db.query(`
    select img_path, img_name from feedsimg where feedno = ?
  `, [feedNo]);
  const images = imgRows.map(img => ({
    src: `http://localhost:3005${img.img_path}${img.img_name}`,
    imgName: img.img_name
  }));

  const [commentRows] = await db.query(`
    select c.commentno as commentId, u.username as userName, c.contents as content
    from comments c
    join user u on c.userid = u.userid
    where c.feedno = ? and c.deleteyn = 'N'
    order by c.created_at asc
  `, [feedNo]);

  const [likeCountRows] = await db.query(`
    select count(*) as count from remember where feedno = ?
  `, [feedNo]);
  const likeCount = likeCountRows[0].count;

  let likedByMe = false;
  if (userId) {
    const [likedRows] = await db.query(`
      select * from remember where feedno = ? and userid = ?
    `, [feedNo, userId]);
    likedByMe = likedRows.length > 0;
  }

  const [userRows] = await db.query(`
    select u.userid, u.username, u.tagname, ui.img_path, ui.img_name
    from user u
    left join userimg ui on u.userid = ui.userid
    where u.userid = ?
  `, [feed.userid]);

  const user = userRows.length > 0 ? {
    userId: userRows[0].userid,
    userName: userRows[0].username,
    tagName: userRows[0].tagname,
    profileImg: userRows[0].img_path
      ? `http://localhost:3005${userRows[0].img_path}${userRows[0].img_name}`
      : '/default-profile.png'
  } : null;

  res.json({
    info: {
      feedId: feed.feedno,
      contents: feed.contents,
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

    await conn.query(
      `update feeds set contents = ?, visibility = ?, updated_at = now() where feedno = ?`,
      [contents, visibility, feedNo]
    );

    await conn.query(`delete from feedsimg where feedno = ?`, [feedNo]);
    await conn.query(`delete from fmentions where feedno = ?`, [feedNo]);

    for (const mentionId of mentions) {
      const [type, mentionedNo] = mentionId.split(':');
      const mentionedType = type === 'USER' ? 'USER' : 'DUSER';
      await conn.query(
        `insert into fmentions (feedno, mentionerno, mentionedno, mentionedtype, created_at)
         values (?, ?, ?, ?, now())`,
        [feedNo, userId, mentionedNo, mentionedType]
      );
    }

    await conn.query(`delete from feedtag where feedno = ?`, [feedNo]);

    for (const tag of tags) {
      const [[existing]] = await conn.query(`select tagno from tag where tagname = ?`, [tag.name]);
      let tagNo = existing?.tagno;

      if (!tagNo) {
        const result = await conn.query(`insert into tag (tagname) values (?)`, [tag.name]);
        tagNo = result[0].insertId;
      }

      await conn.query(`insert into feedtag (feedno, tagno) values (?, ?)`, [feedNo, tagNo]);
    }

    await conn.query(`delete from user_log where type = 'mention' and feedno = ?`, [feedNo]);

    for (const mentionId of mentions) {
      const [targetType, targetId] = mentionId.split(':');
      const summary = targetType === 'user'
        ? '언급되었습니다.'
        : '고인을 언급하였습니다.';

      await conn.query(
        `insert into user_log
         (actor_id, feedno, source_type, source_id, type, target_id, target_type, summary, isread, created_at)
         values (?, ?, 'feed', ?, 'mention', ?, ?, ?, 'N', now())`,
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

// 5) 피드 삭제
router.delete('/:feedId', async (req, res) => {
  const feedId = parseInt(req.params.feedId, 10);

  try {
    await db.execute(
      `update feeds set deleteyn = 'Y', updated_at = now() where feedno = ?`,
      [feedId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('피드 삭제 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 피드 등록
router.post('/create', async (req, res) => {
  const { contents, mentions = [], tags = [], userId } = req.body;

  try {
    const [feedResult] = await db.execute(
      `insert into feeds (userid, contents, created_at) values (?, ?, now())`,
      [userId, contents]
    );
    const feedId = feedResult.insertId;

    for (const tag of tags) {
      let tagId;

      if (tag.isNew) {
        const [exists] = await db.execute(`select tagno from tag where tagname = ?`, [tag.name]);
        tagId = exists.length > 0 ? exists[0].tagno
              : (await db.execute(`insert into tag (tagname) values (?)`, [tag.name]))[0].insertId;
      } else {
        const rawId = tag.id;
        const numericId = rawId.includes(':') ? rawId.split(':')[1] : rawId;
        const [rows] = await db.execute(`select tagno from tag where tagno = ?`, [numericId]);
        if (rows.length === 0) continue;
        tagId = rows[0].tagno;
      }

      await db.execute(`insert into feedtag (feedno, tagno) values (?, ?)`, [feedId, tagId]);
    }

    const seenMentions = new Set();
    const logTargets = new Map();

    for (const uid of mentions) {
      if (!uid.includes(':')) continue;
      const [type, id] = uid.split(':');
      const key = `${type}:${id}`;
      if (seenMentions.has(key)) continue;
      seenMentions.add(key);

      await db.execute(
        `insert into fmentions (feedno, mentionerno, mentionedno, mentionedtype, created_at)
         values (?, ?, ?, ?, now())`,
        [feedId, userId, id, type]
      );

      logTargets.set(`${type}:${id}`, {
        actorId: userId,
        feedId,
        sourceType: 'feed',
        sourceId: feedId,
        type: 'mention',
        targetId: id,
        targetType: type,
        summary: type === 'duser' ? '고인을 언급하였습니다.' : '언급되었습니다.'
      });
    }

    logTargets.set(`FEED:${userId}`, {
      actorId: userId,
      feedId,
      sourceType: 'feed',
      sourceId: feedId,
      type: 'feed',
      targetId: userId,
      targetType: 'user',
      summary: ' 피드를 작성했습니다.'
    });

    for (const log of logTargets.values()) {
      await db.execute(
        `insert into user_log
         (actor_id, feedno, source_type, source_id, type, target_id, target_type, summary, isread, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, 'N', now())`,
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

// 좋아요 등록
router.post('/:feedNo/remember', async (req, res) => {
  const feedNo = parseInt(req.params.feedNo, 10);
  const userId = req.body.userId;

  try {
    const [feedRow] = await db.execute(`select userid from feeds where feedno = ?`, [feedNo]);
    const targetUserId = feedRow[0]?.userid;

    await db.execute(`
      insert ignore into remember (feedno, userid, created_at)
      values (?, ?, now())
    `, [feedNo, userId]);

    await db.execute(`
      insert into user_log (
        feedno, actor_id, target_id, target_type, type,
        source_id, source_type, summary, isread, created_at
      ) values (?, ?, ?, 'USER', 'LIKE', ?, 'FEED', ?, 'N', now())
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
    await db.execute(
      `delete from remember where feedno = ? and userid = ?`,
      [feedNo, userId]
    );

    await db.execute(
      `delete from user_log where feedno = ? and actor_id = ? and type = 'LIKE'`,
      [feedNo, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('기억해요 취소 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
