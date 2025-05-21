import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Stack, Paper, Typography
} from '@mui/material';
import ImageUploader from '../common/ImageUploader';
import FeedMentionsInput from './FeedMentionsInput';
import { jwtDecode } from 'jwt-decode';
import './mentions.css';

export default function FeedModal({ open, onClose, onSuccess, initialData = null, mode = 'create' }) {
  const [text, setText] = useState('');
  const [plain, setPlain] = useState('');
  const [mentions, setMentions] = useState([]);
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [visibility, setVisibility] = useState('PUBLIC');
  const MAX_FILES = 5;

  // 토큰 - userId 받아오기
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.id || decoded.userId;
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
    setUserId(id);
    fetch('http://localhost:3005/user/search')
      .then(res => res.json())
      .then(data => setUsers(data.list || []))
      .catch(err => console.error('유저 목록 불러오기 실패:', err));
  }, []);

  useEffect(() => {
    if (initialData) {
      setText(initialData.contents || '');
      setMentions(initialData.mentions || []);
      setPlain(initialData.contents || '');
      setVisibility(initialData.visibility || 'PUBLIC');
      // 수정 모드일 때 기존 이미지 보여주기 위한 구조 추가
      if (initialData.images?.length > 0) {
        const existing = initialData.images.map(img => ({
          src: img.src,
          file: null
        }));
        setFiles(existing);
      }
    }
  }, [initialData]);

  const handleChange = (e, newValue, plainText, mentionList) => {
    setText(newValue);
    setPlain(plainText);
    setMentions(mentionList);
  };

  // 피드 등록
  const handleSave = async () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 1. @mention된 사용자만 추출
    const mentionUserIds = mentions
      .filter(m => m.id.startsWith('USER:') || m.id.startsWith('DUSER:'))
      .map(m => m.id);

    // 2. plainText에서 #태그 추출
    const extractedTags = Array.from(
      new Set((plain.match(/#([^\s#]+)/g) || []).map(t => t.slice(1)))
    );

    const finalTags = extractedTags.map(name => ({ isNew: true, name }));

    try {
      const url =
        mode === 'edit'
          ? `http://localhost:3005/feeds/${initialData.feedId}`
          : `http://localhost:3005/feeds/create`;

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const createRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contents: text,
          mentions: mentionUserIds,
          tags: finalTags,
          visibility,
          images: []
        })
      });

      const createData = await createRes.json();
      if (!createData.success) {
        alert(mode === 'edit' ? '피드 수정 실패' : '피드 등록 실패');
        return;
      }

      const feedId = createData.feedId;

      // 이미지 업로드
      const newFiles = files.filter(f => f.file !== null);
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach(f => formData.append('images', f.file));
        formData.append('feedId', feedId);

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

      setText('');
      setFiles([]);
      onClose();  
      onSuccess?.();
    } catch (err) {
      console.error('[피드 등록 실패]', err);
      alert('피드 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'edit' ? '피드 수정' : '피드 등록'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2">
              <ImageUploader
                multiple
                showDefaultPreview={false}
                onFilesSelected={newFiles => {
                  const formatted = newFiles.map(f => ({ file: f })); // ✅ wrap
                  const combined = [...files, ...formatted];
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

          <Paper variant="outlined" sx={{ p: 1, minHeight: 450 }}>
            <FeedMentionsInput
              text={text}
              onChange={handleChange}
              users={users}
              minHeight={450}
            />
          </Paper>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>공개 범위</Typography>
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
                fontSize: '14px'
              }}
            >
              <option value="PUBLIC">전체공개</option>
              <option value="FRIENDS">팔로우에게만</option>
              <option value="PRIVATE">비공개</option>
            </select>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave}>
          등록
        </Button>
      </DialogActions>
    </Dialog>
  );
}
