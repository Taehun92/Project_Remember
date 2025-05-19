const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// 로그인 (JWT)
router.post("/login", async (req, res) => {
    let { loginId, pwd } = req.body;
    try {
        let query = "SELECT USERID, EMAIL_VERIFIED, PHONE_VERIFIED, STATE, USERNAME, PASSWORD FROM USER WHERE LOGIN_ID = ?"
        let [user] = await db.query(query, [loginId]);
        let result = {};
        if (user.length > 0) {
            let isMatch = await bcrypt.compare(pwd, user[0].PASSWORD);
            if (isMatch) {
                let payload = {
                    userId: user[0].USERID,
                    userName: user[0].USERNAME,
                    everi: user[0].EMAIL_VERIFIED,
                    pveri: user[0].PHONE_VERIFIED,
                    state: user[0].STATE
                }
                const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' });
                result = {
                    success: true,
                    message: "로그인 성공",
                    token: token
                }
            } else {
                result = {
                    success: false,
                    message: "비밀번호 확인 요망"
                }
            }
        } else {
            result = {
                success: false,
                message: "아이디 확인 요망"
            }
        }
        res.json(result);

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
})

// 유저 정보 조회
router.get("/info/:userId", async (req, res) => {
    let userId = parseInt(req.params.userId, 10);
    console.log("유저정보조회용", userId);
    
    try {
        let query = "SELECT U.USERID, U.LOGIN_ID, U.TAGNAME, U.USERNAME, U.BIRTH, U.PHONE, U.PHONE_VERIFIED," +
            " U.EMAIL, U.EMAIL_VERIFIED, U.GENDER, U.ADDR, U.MARKETING, UI.IMG_PATH, UI.IMG_NAME " +
            " FROM USER U LEFT JOIN USERIMG UI ON U.USERID = UI.USERID WHERE U.USERID = ?";
        let [list] = await db.query(query, [userId]);
        res.json({
            message: "result",
            info: list[0]
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
})

// 고인 정보 조회
router.get("/deceased/:userId", async (req, res) => {
    let userId = parseInt(req.params.userId, 10);
    try {
        let query = "SELECT D.DUSERID, D.PRIMARY_USERID, D.AGENT_USERID, D.DUSERNAME, D.DBIRTH, D.DEATH, D.GENDER, D.VISIBILITY," +
            " D.REST_PLACE, D.CONTENTS, D.LINKED_URL, DI.IMG_PATH, DI.IMG_NAME FROM duser D " +
            " INNER JOIN user U ON (D.PRIMARY_USERID = U.USERID OR D.AGENT_USERID = U.USERID)" +
            " LEFT JOIN duserimg DI ON D.DUSERID = DI.DUSERID WHERE U.USERID = ? "
        let [list] = await db.query(query, [userId]);
        res.json({
            message: "result",
            list: list
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
})

// 관리, 팔로우하는 고인의 타임라인 및 피드 불러오기
router.get('/timeline/:userId', async (req, res) => {
    const userId = Number(req.params.userId);
    const sql = `
      WITH RELEVANT_DUSERS AS (
        SELECT DUSERID, 'OWN' AS RELATION_TYPE
        FROM DUSER
        WHERE PRIMARY_USERID = ?
      
        UNION
      
        SELECT FOLLOWEDNO, 'FOLLOW' AS RELATION_TYPE
        FROM FOLLOW
        WHERE FOLLOWERNO = ?
      )
      SELECT
        T.TIMELINENO,
        T.DUSERID,
        D.DUSERNAME,
        T.TYPE,
        T.SUMMARY,
        T.REF_ID,
        T.CREATED_AT,
        F.FEEDNO,
        F.CONTENTS  AS FEED_CONTENTS,
        F.VISIBILITY,
        F.USERID    AS FEED_AUTHOR
      FROM RELEVANT_DUSERS R
      JOIN DTIMELINE T ON R.DUSERID = T.DUSERID
      JOIN DUSER     D ON D.DUSERID = T.DUSERID
      LEFT JOIN FEEDS F ON T.TYPE = 'FEED' AND T.REF_ID = F.FEEDNO
      WHERE
        (
          R.RELATION_TYPE = 'OWN'
          OR (
            R.RELATION_TYPE = 'FOLLOW'
            AND T.TYPE IN ('FEED', 'COMMENT', 'MENTION', 'SYSTEM')
          )
        )
        AND (
          T.TYPE != 'MENTION'
          OR (
            T.TYPE = 'MENTION'
            AND (
              EXISTS (
                SELECT 1 FROM FMENTIONS FM
                WHERE FM.FEEDNO = T.REF_ID AND FM.MENTIONEDNO = T.DUSERID
              )
              OR EXISTS (
                SELECT 1 FROM CMENTIONS CM
                WHERE CM.COMMENTNO = T.REF_ID AND CM.MENTIONEDNO = T.DUSERID
              )
            )
          )
        )
      ORDER BY T.CREATED_AT DESC;
    `;

    try {
        // mysql2 pool 에는 promise() 메서드를 통해 promise 기반 쿼리가 가능합니다.
        const [rows] = await db.query(sql, [userId, userId]);
        res.json({ timeline: rows });
    } catch (err) {
        console.error('🔴 /deceased/timeline 에러:', err);
        res.status(500).json({ message: '타임라인 조회 실패', error: err.message });
    }
});

//유저 정보 수정
router.put('/update', async (req, res) => {
    const { userId, userName, tagname, email, email_verified, phone, phone_verified, birth, gender, addr } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId는 필수입니다.' });
    }

    try {
        const sql = "UPDATE USER SET  USERNAME = ?, TAGNAME = ?, EMAIL = ?, EMAIL_VERIFIED = ?, PHONE = ?, PHONE_VERIFIED = ?, BIRTH = ?, GENDER = ?, ADDR = ?, UPDATED_AT = NOW() WHERE USERID = ? ";
        const values = [userName, tagname, email, email_verified, phone, phone_verified, birth, gender, addr, userId];
        await db.query(sql, values);
        return res.json({ success: true, message: '수정 완료' });
    } catch (err) {
        console.error('❌ 사용자 정보 수정 실패:', err);
        return res.status(500).json({ success: false, message: '서버 오류' });
    }
});


// 태그네임 검색
router.get('/search-tag', async (req, res) => {
    const { tagname } = req.query;

    if (!tagname) {
        return res.status(400).json({ success: false, message: 'tagname이 누락되었습니다.' });
    }

    try {
        const sql = `
            SELECT U.USERID, U.TAGNAME, U.USERNAME, UI.IMG_PATH, UI.IMG_NAME
            FROM USER U
            LEFT JOIN USERIMG UI ON U.USERID = UI.USERID
            WHERE U.TAGNAME LIKE ?
            LIMIT 10
        `;

        const [rows] = await db.query(sql, [`%${tagname}%`]);
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
      SELECT 
        U.USERID AS ID,
        U.TAGNAME AS TAGNAME,
        U.USERNAME AS USERNAME,
        I.IMG_PATH,
        I.IMG_NAME,
        'USER' AS TYPE
      FROM USER U
      LEFT JOIN USERIMG I ON U.USERID = I.USERID
      WHERE U.DELETEYN = 'N'
    `);

    const [dusers] = await db.execute(`
      SELECT 
        D.DUSERID AS ID,
        D.DTAGNAME AS TAGNAME,
        D.DUSERNAME AS USERNAME,
        I.IMG_PATH,
        I.IMG_NAME,
        'DUSER' AS TYPE
      FROM DUSER D
      LEFT JOIN DUSERIMG I ON D.DUSERID = I.DUSERID
    `);

    const resultList = [...users, ...dusers];
    res.json({ list: resultList });
  } catch (err) {
    console.error('[GET /users] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;