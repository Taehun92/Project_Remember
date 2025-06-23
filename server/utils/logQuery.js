async function get_relevant_user_logs(connection, user_id, page = 1, page_size = 10) {
  const offset = (page - 1) * page_size;

  const [managed] = await connection.execute(`
    SELECT duserid FROM duser
    WHERE primary_userid = ? OR agent_userid = ?
  `, [user_id, user_id]);

  const managed_ids = managed.map(row => row.duserid);

  const [followed] = await connection.execute(`
    SELECT followedno FROM follow
    WHERE followerno = ?
  `, [user_id]);

  const followed_ids = followed.map(row => row.followedno);

  const all_duser_ids = [...new Set([...managed_ids, ...followed_ids])];
  if (all_duser_ids.length === 0) return [];

  const placeholders = all_duser_ids.map(() => '?').join(',');

  const [logs] = await connection.query(`
    SELECT * FROM (
      SELECT ul.*, u.tagname, u.username, ui.img_path, ui.img_name
      FROM user_log ul
      JOIN user u ON ul.actor_id = u.userid
      LEFT JOIN userimg ui ON ul.actor_id = ui.userid
      WHERE ul.target_type = 'user' AND ul.target_id = ?

      UNION

      SELECT ul.*, u.tagname, u.username, di.img_path, di.img_name
      FROM user_log ul
      JOIN user u ON ul.actor_id = u.userid
      LEFT JOIN duserimg di ON ul.actor_id = di.duserid
      WHERE ul.target_type = 'duser' AND ul.target_id IN (${placeholders})
    ) AS logs
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [user_id, ...all_duser_ids, page_size, offset]);

  return logs;
}

async function get_mentioned_feeds_by_deceased(connection, duser_id, page = 1, page_size = 10) {
  const offset = (page - 1) * page_size;

  const [logs] = await connection.query(`
    SELECT ul.*, u.tagname, u.username, ui.img_path, ui.img_name
    FROM user_log ul
    JOIN user u ON ul.actor_id = u.userid
    LEFT JOIN userimg ui ON ul.actor_id = ui.userid
    WHERE ul.target_type = 'duser'
      AND ul.target_id = ?
      AND ul.type IN ('mention', 'follow', 'remember')
    ORDER BY ul.created_at DESC
    LIMIT ? OFFSET ?
  `, [duser_id, page_size, offset]);

  return logs;
}

async function get_mentioned_feeds_with_context(connection, duser_id, page = 1, page_size = 10) {
  const offset = (page - 1) * page_size;

  const [mentioned] = await connection.execute(`
    SELECT DISTINCT source_id
    FROM user_log
    WHERE type = 'mention'
      AND target_type = 'duser'
      AND source_type = 'feed'
      AND target_id = ?
  `, [duser_id]);

  const feed_nos = mentioned.map(row => row.source_id);
  if (feed_nos.length === 0) return [];

  const placeholders = feed_nos.map(() => '?').join(',');

  const [logs] = await connection.query(`
    SELECT ul.*, u.tagname, u.username, ui.img_path, ui.img_name
    FROM user_log ul
    JOIN user u ON ul.actor_id = u.userid
    LEFT JOIN userimg ui ON ul.actor_id = ui.userid
    WHERE ul.source_type = 'feed'
      AND ul.source_id IN (${placeholders})
      AND ul.type IN ('like', 'comment')
    ORDER BY ul.created_at DESC
    LIMIT ? OFFSET ?
  `, [...feed_nos, page_size, offset]);

  return logs;
}

module.exports = {
  get_relevant_user_logs,
  get_mentioned_feeds_by_deceased,
  get_mentioned_feeds_with_context
};
