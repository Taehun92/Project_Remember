const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

// 폴더 구분 미들웨어
function setFolder(folder) {
  return (req, res, next) => {
    req.uploadFolder = folder;
    console.log(`[Upload] Target folder set to: ${folder}`);
    next();
  };
}

// 업로드 디렉토리 보장
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[Upload] Created directory: ${dir}`);
  }
}

// Multer 설정 (공통)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder;
    const uploadDir = path.join(__dirname, `../uploads/${folder}`);
    ensureDir(uploadDir);
    console.log(`[Upload] Saving file to directory: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    console.log(`[Upload] Original name: ${file.originalname} -> New filename: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ storage });

// [POST] /upload/profile
router.post(
  '/profile',
  setFolder('profile'),
  upload.single('image'),
  async (req, res) => {
    console.log('[Upload] /profile called');
    console.log('[Upload] req.body:', req.body);
    console.log('[Upload] req.file:', req.file);

    const { id } = req.body;
    if (!req.file || !id) {
      console.warn('[Upload] Missing file or id');
      return res.status(400).json({ success: false, message: '파일 또는 id 누락' });
    }
    const filename = req.file.filename;
    const filepath = '/uploads/profile/';

    try {
      const [exists] = await db.query('select * from userimg where userid = ?', [id]);
      console.log(`[Upload] userimg exists count: ${exists.length}`);
      if (exists.length) {
        await db.query(
          'update userimg set img_name = ?, img_path = ?, updated_at = now() where userid = ?',
          [filename, filepath, id]
        );
        console.log('[Upload] userimg updated for userId:', id);
      } else {
        await db.query(
          'insert into userimg (userid, img_name, img_path, created_at, updated_at) values (?, ?, ?, now(), now())',
          [id, filename, filepath]
        );
        console.log('[Upload] userimg inserted for userId:', id);
      }
      return res.json({ success: true, filename, filepath });
    } catch (err) {
      console.error('[Upload] DB error:', err);
      return res.status(500).json({ success: false, message: '서버 오류' });
    }
  }
);

// [POST] /upload/deceased
router.post('/deceased', setFolder('deceased'), upload.single('image'), async (req, res) => {
  console.log('[Upload] /deceased called');
  console.log('[Upload] req.body:', req.body);
  console.log('[Upload] req.file:', req.file);

  const { id } = req.body;
  if (!req.file || !id) {
    console.warn('[Upload] Missing file or id');
    return res.status(400).json({ success: false, message: '파일 또는 id 누락' });
  }
  const filename = req.file.filename;
  const filepath = '/uploads/deceased/';

  try {
    const [exists] = await db.query('select * from duserimg where duserid = ?', [id]);
    console.log(`[Upload] duserimg exists count: ${exists.length}`);
    if (exists.length) {
      await db.query(
        'update duserimg set img_name = ?, img_path = ? where duserid = ?',
        [filename, filepath, id]
      );
      console.log('[Upload] duserimg updated for duserId:', id);
    } else {
      await db.query(
        'insert into duserimg (duserid, img_name, img_path) values (?, ?, ?)',
        [id, filename, filepath]
      );
      console.log('[Upload] duserimg inserted for duserId:', id);
    }
    return res.json({ success: true, filename, filepath });
  } catch (err) {
    console.error('[Upload] DB error:', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// [POST] /upload/feed
router.post('/feed', setFolder('feed'), upload.array('images'), async (req, res) => {
  const { feedId } = req.body;
  const files = req.files;
  console.log("이미지 등록용 FEED ID", feedId);

  if (!feedId || !files || files.length === 0) {
    return res.status(400).json({ success: false, message: '필수 데이터 누락' });
  }

  try {
    for (const file of files) {
      await db.execute(
        `insert into feedsimg (feedno, img_path, img_name, created_at) values (?, ?, ?, now())`,
        [feedId, '/uploads/feed/', file.filename]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[이미지 저장 실패]', err);
    res.status(500).json({ success: false, message: '이미지 저장 실패' });
  }
});

module.exports = router;
