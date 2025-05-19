const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt'); // 비밀번호 해시화 패키지
const jwt = require('jsonwebtoken');
const router = express.Router();

// 회원가입
router.post("/", async (req, res) => {
    const { email, loginId, userName, password, birth, phone, gender, addr, marketing, email_verified, phone_verified } = req.body;
    try {
        let hashPwd = await bcrypt.hash(password, 10);
        let query = "INSERT INTO USER ( USERID, EMAIL, LOGIN_ID, USERNAME, PASSWORD, BIRTH, PHONE, GENDER, ADDR, STATE, CREATED_AT, VISIBILITY, DELETEYN, MARKETING, EMAIL_VERIFIED, PHONE_VERIFIED)"
            + " VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, 'USER', NOW(), 'PUBLIC', 'N', ?, ?, ?) ";
        let values = [email, loginId, userName, hashPwd, birth, phone, gender, addr, marketing, email_verified, phone_verified]
        let [user] = await db.query(query, values);
        res.json({
            success: true,
            message: '회원가입 성공!',
            result: user[0]
        });
    } catch (err) {
        console.log("에러 발생!");
        console.log(err);
        res.status(500).json({
            success: false,
            message: '회원가입 실패',
            error: err.message
        });
    }
})

// ID 중복체크
router.post("/loginId", async (req, res) => {
    let { loginId } = req.body;
    try {
        let [rows] = await db.query("SELECT COUNT(*) AS count FROM USER WHERE LOGIN_ID = '" + loginId + "'");

        if (rows[0].count > 0) {
            return res.json({
                success: true,
                exists: true,
                message: '이미 사용 중인 아이디입니다.'
            });
        } else {
            return res.json({
                success: true,
                exists: false,
                message: '사용 가능한 아이디입니다.'
            });
        }
    } catch (err) {
        console.error('중복확인 에러:', err);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
})

// 태그네임 중복체크
router.get('/tagName', async (req, res) => {
    const { tagName } = req.query;
    try{
        let [rows] = await db.query('SELECT COUNT(*) AS count FROM USER WHERE TAGNAME = ?', ['@' + tagName]);
        
        if (rows[0].count > 0) {
            return res.json({
                success: true,
                exists: true,
                message: '이미 사용 중인 태그네임 입니다.'
            });
        } else {
            return res.json({
                success: true,
                exists: false,
                message: '사용 가능한 태그네임 입니다.'
            });
        }
    } catch (err) {
        console.error('중복확인 에러:', err);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
  });



module.exports = router;