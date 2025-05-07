// src/components/join/steps/StepPassword.js
import React, { useState } from 'react';
import { Box, TextField, Typography, Button, Stack } from '@mui/material';

function StepPassword({ onNext, onBack, formData, setFormData }) {
  const [password, setPassword] = useState(formData.password || '');
  const [confirmPassword, setConfirmPassword] = useState(formData.confirmPassword || '');
  const [error, setError] = useState('');

  const validatePassword = () => {
    if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) return '영문과 숫자를 포함해야 합니다.';
    if (password !== confirmPassword) return '비밀번호가 일치하지 않습니다.';
    return '';
  };

  const handleNext = () => {
    const errorMsg = validatePassword();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    // 유효성 통과 시 상태 저장 후 다음으로
    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword,
    }));
    onNext();
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>비밀번호를 설정하세요</Typography>

      <Stack spacing={2}>
        <TextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          fullWidth
        />

        <TextField
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          fullWidth
        />

        {error && <Typography color="error">{error}</Typography>}

        <Stack direction="row" justifyContent="space-between" mt={2}>
          <Button variant="outlined" onClick={onBack}>이전</Button>
          <Button variant="contained" onClick={handleNext}>다음</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default StepPassword;