import React, { useState } from 'react';
import {
  TextField,
  Button,
  Stack,
  Typography
} from '@mui/material';

function StepId({ onNext, formData, setFormData }) {
  const [loginId, setLoginId] = useState(formData.loginId || '');
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [error, setError] = useState('');

  const handleCheckDuplicate = async () => {
    if (loginId.trim().length < 4) {
      setError('아이디는 4자 이상이어야 합니다.');
      return;
    } 
    try {
      const res = await fetch('http://localhost:3005/join/loginId', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId }),
      });
      const data = await res.json();
      alert(data.message);
      if (!data.exists) {
        setIsDuplicateChecked(true); // 중복 아님 → 다음 단계 가능
      }
    } catch (err) {
      alert('중복 확인 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleNext = () => {
    if (isDuplicateChecked) {
      setFormData({ ...formData, loginId });
      onNext();
    } else {
      setError('아이디 중복 확인이 필요합니다.');
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight="bold">
        아이디를 입력해주세요
      </Typography>

      <Stack direction="row" spacing={2}>
        <TextField
          label="Login ID"
          fullWidth
          value={loginId}
          disabled={isDuplicateChecked} // ✅ 중복 확인 후 비활성화
          onChange={(e) => {
            setLoginId(e.target.value);
            setIsDuplicateChecked(false);
            setError('');
          }}
          error={!!error}
          helperText={error}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={handleCheckDuplicate}
          disabled={isDuplicateChecked} // ✅ 중복 확인 후 버튼도 비활성화
          sx={{
            minWidth: '120px',
            height: '56px'
          }}
        >
          중복 확인
        </Button>
      </Stack>

      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" onClick={handleNext} disabled={!loginId}>
          다음
        </Button>
      </Stack>
    </Stack>
  );
}

export default StepId;