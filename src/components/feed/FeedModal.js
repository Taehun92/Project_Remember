import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Stack, Paper, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ImageUploader from '../common/ImageUploader';
import FeedMentionsInput from './FeedMentionsInput';
import { jwtDecode } from 'jwt-decode';
import './mentions.css';

export default function FeedModal({ open, onClose, onSubmit, onSuccess }) {
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState([]);
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const MAX_FILES = 5;


  // ✨ 유저 ID 추출 함수
  const getUserIdFromToken = () => {        // 저장된 키 전체 보기
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode(token); // 💡 payload 자동 디코딩
      return decoded.id || decoded.userId; // 필드 이름은 백엔드에 따라 다름
    } catch (err) {
      console.error('[JWT Decode Error]', err);
      return null;
    }
  };


  useEffect(() => {
    const id = getUserIdFromToken();
    if (!id) {
      alert('로그인이 필요합니다.');
      return;
    }
    setUserId(id); // ✅ 상태로 반영

    fetch('http://localhost:3005/user/search')
      .then(res => res.json())
      .then(data => {
        setUsers(data.list);
        console.log(data.list);
      })
      .catch(err => {
        console.error('유저 목록 불러오기 실패:', err);
      });
  }, []);

  const handleChange = (e, newValue, plainText, mentionList) => {
    setText(newValue);         // markup 포함된 텍스트
    setMentions(mentionList);  // [{ id, display }] 형태
  };

  const mentionUsers = mentions.filter(m =>
    m.id.startsWith('USER:') || m.id.startsWith('DUSER:')
  );
  const mentionUserIds = mentionUsers.map(m => m.id);

  // 🏷️ 태그 대상 (new: 또는 기존 숫자 ID)
  const tagMentions = mentions.filter(m =>
    m.id.startsWith('new:') || /^\d+$/.test(m.id)
  );
  const tagData = tagMentions.map(m => {
    if (m.id.startsWith('new:')) {
      return { isNew: true, name: m.id.slice(4) };
    } else {
      return { isNew: false, id: m.id };
    }
  });

  const handleSave = async () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 1️⃣ 먼저 피드 생성
      const createRes = await fetch('http://localhost:3005/feeds/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contents: text,
          mentions: mentionUserIds,
          tags: tagData,
          images: [] // 이미지 없이 먼저 저장
        })
      });

      const createData = await createRes.json();

      if (!createData.success) {
        alert('피드 저장에 실패했습니다.');
        return;
      }

      const feedId = createData.feedId;

      // 2️⃣ 이미지가 있다면 업로드
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('images', file);
        });
        formData.append('feedId', feedId); // 필수!

        const uploadRes = await fetch('http://localhost:3005/upload/feed', {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          alert('이미지 업로드에 실패했습니다.');
          return;
        }
      }

      // 3️⃣ 완료 처리
      setText('');
      setFiles([]);
      onClose();      // 모달 닫기
      onSuccess();
  } catch (err) {
    console.error('[피드 등록 실패]', err);
    alert('피드 등록 중 오류가 발생했습니다.');
  }
};

return (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>피드 등록</DialogTitle>
    <DialogContent>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2">
            <ImageUploader
              multiple
              showDefaultPreview={false}
              onFilesSelected={newFiles => {
                const combined = [...files, ...newFiles];
                if (combined.length > MAX_FILES) {
                  alert(`이미지는 최대 ${MAX_FILES}장까지 업로드 가능합니다.`);
                  setFiles(combined.slice(0, MAX_FILES));
                } else {
                  setFiles(combined);
                }
              }}
            />
          </Typography>
        </Box>

        {files.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={1}>
            {files.map((file, idx) => (
              <Box key={idx} position="relative" width={80} height={80}>
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                />
                <IconButton
                  size="small"
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                  sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(255,255,255,0.8)' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Paper variant="outlined" sx={{ p: 1, minHeight: 120, position: 'relative' }}>
          <FeedMentionsInput
            text={text}
            onChange={handleChange}
            users={users}
          />
        </Paper>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>취소</Button>
      <Button variant="contained" onClick={handleSave}>
        등록
      </Button>
    </DialogActions>

    <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)}>
      <DialogTitle>✅ 피드 등록 완료</DialogTitle>
      <DialogContent>
        <Typography>피드가 성공적으로 등록되었습니다.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenSuccessDialog(false)} autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  </Dialog>

);
}
