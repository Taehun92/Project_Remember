import React, { useState } from 'react';
import {
  Box, TextField, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

function StepEmail({ onNext, onBack, formData, setFormData }) {
  const [email, setEmail] = useState(formData.email || '');
  const [verifyCode, setVerifyCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);

  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendCode = () => {
    if (!isEmailValid(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    const dummyCode = '123456';
    setSentCode(dummyCode);
    setError('');
    alert(`인증 코드가 이메일로 전송되었습니다. (예시 코드: ${dummyCode})`);
  };

  const handleVerify = () => {
    if (verifyCode === sentCode) {
      setVerified(true);
      alert('인증이 완료되었습니다.');
    } else {
      setError('인증 코드가 일치하지 않습니다.');
    }
  };

  const handleNext = () => {
    if (!email || !verified) {
      // 인증도, 입력도 안했을 경우 경고
      setConfirmSkipOpen(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        email,
        emailVerified: verified,
      }));
      onNext();
    }
  };

  const confirmAndProceed = () => {
    setFormData((prev) => ({
      ...prev,
      email: '',
      emailVerified: false,
    }));
    setConfirmSkipOpen(false);
    onNext();
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>이메일을 입력해주세요</Typography>

      <Stack spacing={2}>
        <TextField
          label="이메일 주소"
          type="email"
          value={email}
          onChange={(e) => {
            const value = e.target.value;
            setEmail(value);

            // 이메일 형식 검사
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setError(emailRegex.test(value) ? '' : '올바른 이메일 형식이 아닙니다.');

            // 인증 상태 초기화
            setVerified(false);
            setSentCode('');
            setVerifyCode('');
          }}
          fullWidth
          error={Boolean(error)}
          helperText={error}
        />

        <Button
          variant="outlined"
          onClick={handleSendCode}
          disabled={!email || Boolean(error)}
        >
          인증 코드 전송
        </Button>

        {sentCode && (
          <Stack direction="row" spacing={2}>
            <TextField
              label="인증 코드 입력"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleVerify}>인증 확인</Button>
          </Stack>
        )}

        {error && <Typography color="error">{error}</Typography>}

        <Stack direction="row" justifyContent="space-between" mt={2}>
          <Button variant="outlined" onClick={onBack}>이전</Button>
          <Button variant="contained" onClick={handleNext}>
            다음
          </Button>
        </Stack>
      </Stack>

      {/* 건너뛰기 확인 다이얼로그 */}
      <Dialog open={confirmSkipOpen} onClose={() => setConfirmSkipOpen(false)}>
        <DialogTitle>알림</DialogTitle>
        <DialogContent>
          <Typography>
            이메일 인증을 건너뛰면 일부 서비스 이용에 제한이 있을 수 있습니다.
          </Typography>
          <Typography>
            추 후 '마이페이지'에서 수정/등록 가능합니다.진행하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSkipOpen(false)}>취소</Button>
          <Button onClick={confirmAndProceed} autoFocus>확인</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StepEmail;