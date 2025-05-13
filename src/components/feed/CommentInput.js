// src/components/comment/CommentInput.jsx
import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function CommentInput({ feedNo, onSubmit }) {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (!text.trim()) return;

    const res = await fetch(`http://localhost:3005/feeds/${feedNo}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 3, // 실제 로그인 유저 ID로 대체
        contents: text,
        mentions: []
      })
    });

    if (res.ok) {
      setText('');
      if (onSubmit) onSubmit();
    }
  };

  return (
    <Box mt={2}>
      <TextField
        fullWidth
        label="댓글을 입력하세요"
        variant="outlined"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 1 }}
      >
        등록
      </Button>
    </Box>
  );
}
