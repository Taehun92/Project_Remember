const express = require('express');
const router = express.Router();
const db = require('../db');


// 태그 검색 기능
router.get('/tags/search', async (req, res) => {
  const tagName = req.query.tagName;
  if (!tagName) return res.status(400).json({ message: 'tagName 파라미터 누락' });

  try {
    const [rows] = await db.execute(
      `SELECT TAGNO, TAGNAME FROM TAG WHERE TAGNAME LIKE ? ORDER BY TAGNAME`,
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

      // 중복 제거 (같은 로그 ID나 SOURCE_ID + TYPE 조합 기준으로)
      const seen = new Set();
      logs = logs.filter(log => {
        const key = `${log.SOURCE_ID}_${log.TYPE}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // 최신순 정렬
      logs.sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT));
    }

    const result = [];

    for (const log of logs) {
      const actor = {
        userId: log.ACTOR_ID,
        tagName: log.TAGNAME,
        userName: log.USERNAME,
        profileImg: log.IMG_PATH
          ? `http://localhost:3005${log.IMG_PATH}${log.IMG_NAME}`
          : '/default-profile.png'
      };

      let source = null;

      if (log.SOURCE_TYPE === 'FEED') {
        const [rows] = await connection.execute(
          `SELECT F.CONTENTS, I.IMG_PATH, I.IMG_NAME
           FROM FEEDS F
           LEFT JOIN FEEDSIMG I ON F.FEEDNO = I.FEEDNO
           WHERE F.FEEDNO = ? AND F.DELETEYN = 'N'`,
          [log.SOURCE_ID]
        );

        if (rows.length === 0) continue;

        source = {
          type: 'FEED',
          id: log.SOURCE_ID,
          content: rows[0].CONTENTS,
          images: rows
            .map(r => r.IMG_PATH ? `http://localhost:3005${r.IMG_PATH}${r.IMG_NAME}` : null)
            .filter(Boolean)
        };
      } else if (log.SOURCE_TYPE === 'COMMENT') {
        const [rows] = await connection.execute(
          `SELECT C.CONTENTS, C.FEEDNO FROM COMMENTS C WHERE C.COMMENTNO = ?`,
          [log.SOURCE_ID]
        );
        if (rows.length === 0) continue;

        source = {
          type: 'COMMENT',
          id: log.SOURCE_ID,
          content: rows[0].CONTENTS,
          feedId: rows[0].FEEDNO
        };
      }

      result.push({
        logId: log.LOG_ID,
        summary: log.SUMMARY,
        createdAt: log.CREATED_AT,
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