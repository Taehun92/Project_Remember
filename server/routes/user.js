const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// 로그인 (JWT)
router.post("/login", async (req, res) => {
    const { loginId, pwd } = req.body;
    try {
        const query = `
            select userid, email_verified, phone_verified, state, username, password 
            from user 
            where login_id = ?
        `;
        const [user] = await db.query(query, [loginId]);
        let result = {};

        if (user.length > 0) {
            const isMatch = await bcrypt.compare(pwd, user[0].password);
            if (isMatch) {
                const payload = {
                    userId: user[0].userid,
                    userName: user[0].username,
                    everi: user[0].email_verified,
                    pveri: user[0].phone_verified,
                    state: user[0].state
                };
                const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' });
                result = { success: true, message: "로그인 성공", token };
            } else {
                result = { success: false, message: "비밀번호 확인 요망" };
            }
        } else {
            result = { success: false, message: "아이디 확인 요망" };
        }

        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// 유저 정보 조회
router.get("/info/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    try {
        const query = `
            select u.userid, u.login_id, u.tagname, u.username, u.birth, u.phone, u.phone_verified,
                   u.email, u.email_verified, u.gender, u.addr, u.marketing,
                   ui.img_path, ui.img_name
            from user u
            left join userimg ui on u.userid = ui.userid
            where u.userid = ?
        `;
        const [list] = await db.query(query, [userId]);
        res.json({ message: "result", info: list[0] });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// 고인 정보 조회
router.get("/deceased/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    try {
        const query = `
            select d.duserid, d.primary_userid, d.agent_userid, d.dusername, d.dbirth, d.death, d.gender, d.visibility,
                   d.rest_place, d.contents, d.linked_url,
                   di.img_path, di.img_name
            from duser d
            inner join user u on (d.primary_userid = u.userid or d.agent_userid = u.userid)
            left join duserimg di on d.duserid = di.duserid
            where u.userid = ?
        `;
        const [list] = await db.query(query, [userId]);
        res.json({ message: "result", list });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// 타임라인 및 피드 조회
router.get('/timeline/:userId', async (req, res) => {
    const userId = Number(req.params.userId);
    const sql = `
      with relevant_dusers as (
        select duserid, 'OWN' as relation_type from duser where primary_userid = ?
        union
        select followedno, 'FOLLOW' as relation_type from follow where followerno = ?
      )
      select
        t.timelineno,
        t.duserid,
        d.dusername,
        t.type,
        t.summary,
        t.ref_id,
        t.created_at,
        f.feedno,
        f.contents as feed_contents,
        f.visibility,
        f.userid as feed_author
      from relevant_dusers r
      join dtimeline t on r.duserid = t.duserid
      join duser d on d.duserid = t.duserid
      left join feeds f on t.type = 'feed' and t.ref_id = f.feedno
      where (
        r.relation_type = 'OWN'
        or (
          r.relation_type = 'follow'
          and t.type in ('feed', 'comment', 'mention', 'system')
        )
      )
      and (
        t.type != 'mention'
        or (
          t.type = 'mention'
          and (
            exists (select 1 from fmentions fm where fm.feedno = t.ref_id and fm.mentionedno = t.duserid)
            or exists (select 1 from cmentions cm where cm.commentno = t.ref_id and cm.mentionedno = t.duserid)
          )
        )
      )
      order by t.created_at desc;
    `;
    try {
        const [rows] = await db.query(sql, [userId, userId]);
        res.json({ timeline: rows });
    } catch (err) {
        console.error('🔴 /deceased/timeline 에러:', err);
        res.status(500).json({ message: '타임라인 조회 실패', error: err.message });
    }
});

// 유저 정보 수정
router.put('/update', async (req, res) => {
    const { userId, userName, tagName, email, email_verified, phone, phone_verified, birth, gender, addr } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId는 필수입니다.' });
    }

    try {
        const sql = `
            update user 
            set username = ?, tagname = ?, email = ?, email_verified = ?, 
                phone = ?, phone_verified = ?, birth = ?, gender = ?, addr = ?, updated_at = now()
            where userid = ?
        `;
        const values = [userName, tagName, email, email_verified, phone, phone_verified, birth, gender, addr, userId];
        await db.query(sql, values);
        return res.json({ success: true, message: '수정 완료' });
    } catch (err) {
        console.error('❌ 사용자 정보 수정 실패:', err);
        return res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// 태그네임 검색
router.get('/search-tag', async (req, res) => {
    const { tagName } = req.query;

    if (!tagName) {
        return res.status(400).json({ success: false, message: 'tagName이 누락되었습니다.' });
    }

    try {
        const sql = `
            select u.userid, u.tagname, u.username, ui.img_path, ui.img_name
            from user u
            left join userimg ui on u.userid = ui.userid
            where u.tagname like ?
            limit 10
        `;
        const [rows] = await db.query(sql, [`%${tagName}%`]);
        res.json({ success: true, list: rows });
    } catch (err) {
        console.error('❌ 태그네임 검색 오류:', err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// 멘션용 유저/고인 정보 조회
router.get('/search', async (req, res) => {
  try {
    const [users] = await db.execute(`
      select 
        u.userid as id,
        u.tagname as tagname,
        u.username as username,
        i.img_path,
        i.img_name,
        'USER' as type
      from user u
      left join userimg i on u.userid = i.userid
      where u.deleteyn = 'N'
    `);

    const [dusers] = await db.execute(`
      select 
        d.duserid as id,
        d.dtagname as tagname,
        d.dusername as username,
        i.img_path,
        i.img_name,
        'DUSER' as type
      from duser d
      left join duserimg i on d.duserid = i.duserid
    `);

    const resultList = [...users, ...dusers];
    res.json({ list: resultList });
  } catch (err) {
    console.error('[GET /users] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
