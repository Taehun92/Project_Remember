const express = require('express');
const router = express.Router();
const db = require('../db');

// 태그 검색 기능
router.get('/tags/search', async (req, res) => {
  const tagName = req.query.tagName;
  if (!tagName) return res.status(400).json({ message: 'tagName 파라미터 누락' });

  try {
    const [rows] = await db.execute(
      `select tagno, tagname from tag where tagname like ? order by tagname`,
      [`%${tagName}%`]
    );
    res.json({ list: rows });
  } catch (err) {
    console.error('[GET /tags/search] 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});


// 타임라인 + 뉴스피드
const {
  getRelevantUserLogs,
  getMentionedFeedsByDeceased,
  getMentionedFeedsWithContext
} = require('../utils/logQuery');

router.get('/newsfeed', async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId) : null;
  const duserId = req.query.duserId ? parseInt(req.query.duserId) : null;

  if (!userId && !duserId) {
    return res.status(400).json({ error: 'userId 또는 duserId 중 하나는 필수입니다.' });
  }

  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 50);

  const connection = await db.getConnection();
  try {
    let logs = [];

    if (userId) {
      logs = await getRelevantUserLogs(connection, userId, page, pageSize);
    } else if (duserId) {
      const logsA = await getMentionedFeedsByDeceased(connection, duserId, page, pageSize);
      const logsB = await getMentionedFeedsWithContext(connection, duserId, page, pageSize);
      logs = [...logsA, ...logsB];

      const seen = new Set();
      logs = logs.filter(log => {
        const key = `${log.source_id}_${log.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const result = [];

    for (const log of logs) {
      const actor = {
        userId: log.actor_id,
        tagName: log.tagname,
        userName: log.username,
        profileImg: log.img_path
          ? `http://localhost:3005${log.img_path}${log.img_name}`
          : '/default-profile.png'
      };

      let source = null;

      if (log.source_type === 'FEED') {
        const [rows] = await connection.execute(
          `select f.contents, i.img_path, i.img_name
           from feeds f
           left join feedsimg i on f.feedno = i.feedno
           where f.feedno = ? and f.deleteyn = 'N'`,
          [log.source_id]
        );

        if (rows.length === 0) continue;

        source = {
          type: 'FEED',
          id: log.source_id,
          content: rows[0].contents,
          images: rows
            .map(r => r.img_path ? `http://localhost:3005${r.img_path}${r.img_name}` : null)
            .filter(Boolean)
        };
      } else if (log.source_type === 'COMMENT') {
        const [rows] = await connection.execute(
          `select c.contents, c.feedno from comments c where c.commentno = ?`,
          [log.source_id]
        );
        if (rows.length === 0) continue;

        source = {
          type: 'COMMENT',
          id: log.source_id,
          content: rows[0].contents,
          feedId: rows[0].feedno
        };
      }

      result.push({
        logId: log.log_id,
        summary: log.summary,
        createdAt: log.created_at,
        actor,
        source
      });
    }

    res.json(result);
  } catch (err) {
    console.error('뉴스피드 조회 오류:', err);
    res.status(500).json({ error: '뉴스피드 조회 실패' });
  } finally {
    connection.release();
  }
});

module.exports = router;
