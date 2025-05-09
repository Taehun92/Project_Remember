// src/components/feed/FeedModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import { MentionsInput, Mention } from 'react-mentions';
import ImageUploader from '../common/ImageUploader';
import './mentions.css';

export default function FeedModal({ open, onClose, onSubmit }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  // useEffect(() => {
  //   fetch('http://localhost:3005/user/list')  // ✅ 백엔드 서버 주소 명시
  //     .then(res => res.json())
  //     .then(data => {
  //       console.log('✅ user list:', data);
  //       setUsers(data.users || []);
  //     });

  //   fetch('http://localhost:3005/tags')  // ✅ 태그 API도 백엔드 주소로
  //     .then(res => res.json())
  //     .then(data => {
  //       console.log('✅ tag list:', data);
  //       setTags(data.tags || []);
  //     });
  // }, []);

  useEffect(() => {
    // 👉 실제 API 대신 목 데이터로 초기값 설정
    setUsers([
      { USERID: 1, TAGNAME: '홍길동' },
      { USERID: 2, TAGNAME: '김철수' },
      { USERID: 3, TAGNAME: '박영희' },
    ]);
  
    setTags([
      { TAGNO: 1, TAGNAME: '테스트' },
      { TAGNO: 2, TAGNAME: '개발자' },
      { TAGNO: 3, TAGNAME: '리액트' },
    ]);
  }, []);

  const userSuggestions = users.map(u => ({ id: u.USERID, display: u.TAGNAME }));
  const tagSuggestions = tags.map(t => ({ id: t.TAGNO, display: t.TAGNAME }));

  const handleSave = () => {
    onSubmit({ contents: text, attachments: files });
    setText('');
    setFiles([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>피드 등록</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <MentionsInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mentions__input"
          >
            <Mention
              trigger="@"
              data={userSuggestions}
              className="mentions__mention"
            />
            <Mention
              trigger="#"
              data={tagSuggestions}
              className="mentions__mention"
            />
          </MentionsInput>
        </Box>
        <ImageUploader
          currentImages={files.map(f => URL.createObjectURL(f))}
          multiple
          onFilesSelected={setFiles}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave}>등록</Button>
      </DialogActions>
    </Dialog>
  );
}
