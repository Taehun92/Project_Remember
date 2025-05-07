import React, { useState } from 'react';
import {
  Box, TextField, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

function StepPhone({ onNext, onBack, formData, setFormData }) {
  const [phone, setPhone] = useState(formData.phone || '');
  const [verifyCode, setVerifyCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);

  const isPhoneValid = (phone) => /^010[0-9]{8}$/.test(phone.replace(/-/g, ''));

  const handleSendCode = () => {
    if (!isPhoneValid(phone)) {
      setError('올바른 휴대폰 번호를 입력해주세요. 예: 01012345678');
      return;
    }

    const dummyCode = '654321';
    setSentCode(dummyCode);
    setError('');
    alert(`인증 코드가 문자로 전송되었습니다. (예시 코드: ${dummyCode})`);
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
    if (!phone) {
      setConfirmSkipOpen(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        phone,
        phoneVerified: verified,
      }));
      onNext();
    }
  };

  const confirmAndProceed = () => {
    setFormData((prev) => ({
      ...prev,
      phone: '',
      phoneVerified: false,
    }));
    setConfirmSkipOpen(false);
    onNext();
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>휴대폰 번호를 입력해주세요</Typography>

      <Stack spacing={2}>
        <TextField
          label="휴대폰 번호"
          placeholder="01012345678"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError('');
            setVerified(false);
            setSentCode('');
            setVerifyCode('');
          }}
          fullWidth
        />

        <Button
          variant="outlined"
          onClick={handleSendCode}
          disabled={!phone}
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

      <Dialog open={confirmSkipOpen} onClose={() => setConfirmSkipOpen(false)}>
        <DialogTitle>알림</DialogTitle>
        <DialogContent>
          <Typography>
            휴대폰 인증을 건너뛰면 일부 서비스 이용에 제한이 있을 수 있습니다.
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

export default StepPhone;
