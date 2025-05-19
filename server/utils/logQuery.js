async function getRelevantUserLogs(connection, userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  // 1. 관리 중인 고인
  const [managed] = await connection.execute(`
    SELECT DUSERID FROM DUSER
    WHERE PRIMARY_USERID = ? OR AGENT_USERID = ?
  `, [userId, userId]);

  const managedIds = managed.map(row => row.DUSER_ID);

  // 2. 팔로우 중인 고인
  const [followed] = await connection.execute(`
    SELECT FOLLOWEDNO FROM FOLLOW
    WHERE FOLLOWERNO = ?
  `, [userId]);

  const followedIds = followed.map(row => row.FOLLOWED_NO);

  // 3. 유효한 고인 ID 목록
  const allDuserIds = [...new Set([...managedIds, ...followedIds])];
  const placeholders = allDuserIds.map(() => '?').join(',');

  // 4. 로그 가져오기
  if (followedIds.length === 0) {
    // 빈 리스트일 경우 쿼리 자체를 다르게 하거나, WHERE절 생략
    return [];
  }

  const [logs] = await connection.query(
    `
    (
      SELECT UL.*, U.TAGNAME, U.USERNAME, UI.IMG_PATH, UI.IMG_NAME
      FROM USER_LOG UL
      JOIN USER U ON UL.ACTOR_ID = U.USERID
      LEFT JOIN USERIMG UI ON UL.ACTOR_ID = UI.USERID
      WHERE UL.TARGET_TYPE = 'USER'
        AND UL.TARGET_ID = ?
    )
    UNION
    (
      SELECT UL.*, U.TAGNAME, U.USERNAME, DI.IMG_PATH, DI.IMG_NAME
      FROM USER_LOG UL
      JOIN USER U ON UL.ACTOR_ID = U.USERID
      LEFT JOIN DUSERIMG DI ON UL.ACTOR_ID = DI.DUSERID
      WHERE UL.TARGET_TYPE = 'DUSER'
        AND UL.TARGET_ID IN (${followedIds.map(() => '?').join(',')})
    )
    ORDER BY CREATED_AT DESC
    LIMIT 10 OFFSET ?
  `,
    [userId, ...followedIds, offset]
  );

  return logs;
}

async function getMentionedFeedsByDeceased(connection, duserId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const [logs] = await connection.query(`
    SELECT UL.*, U.TAGNAME, U.USERNAME, UI.IMG_PATH, UI.IMG_NAME
    FROM USER_LOG UL
    JOIN USER U ON UL.ACTOR_ID = U.USERID
    LEFT JOIN USERIMG UI ON UL.ACTOR_ID = UI.USERID
    WHERE UL.TARGET_TYPE = 'DUSER'
      AND UL.TARGET_ID = ?
      AND UL.TYPE IN ('MENTION', 'FOLLOW', 'REMEMBER')
    ORDER BY UL.CREATED_AT DESC
    LIMIT ? OFFSET ?
  `, [duserId, pageSize, offset]);

  return logs;
}

async function getMentionedFeedsWithContext(connection, duserId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  // 먼저 고인이 언급된 피드번호 목록을 조회
  const [mentioned] = await connection.execute(`
    SELECT DISTINCT SOURCE_ID
    FROM USER_LOG
    WHERE TYPE = 'MENTION'
      AND TARGET_TYPE = 'DUSER'
      AND SOURCE_TYPE = 'FEED'
      AND TARGET_ID = ?
  `, [duserId]);

  const feedNos = mentioned.map(row => row.SOURCE_ID);
  if (feedNos.length === 0) return []; // 해당 피드가 없으면 바로 반환

  const placeholders = feedNos.map(() => '?').join(',');

  const [logs] = await connection.query(`
    SELECT UL.*, U.TAGNAME, U.USERNAME, UI.IMG_PATH, UI.IMG_NAME
    FROM USER_LOG UL
    JOIN USER U ON UL.ACTOR_ID = U.USERID
    LEFT JOIN USERIMG UI ON UL.ACTOR_ID = UI.USERID
    WHERE UL.SOURCE_TYPE = 'FEED'
      AND UL.SOURCE_ID IN (${placeholders})
      AND UL.TYPE IN ('LIKE', 'COMMENT')
    ORDER BY UL.CREATED_AT DESC
    LIMIT ? OFFSET ?
  `, [...feedNos, pageSize, offset]);

  return logs;
}

module.exports = {
  getRelevantUserLogs,
  getMentionedFeedsByDeceased,
  getMentionedFeedsWithContext
};
