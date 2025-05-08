import React, { useState } from 'react';
import {
  Box, TextField, Typography, Button, Stack, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

function StepExtra({ onNext, onBack, formData, setFormData }) {
  const [name, setName] = useState(formData.name || '');
  const [gender, setGender] = useState(formData.gender || '');
  const [birth, setBirth] = useState(formData.birth || '');
  const [addr, setAddr] = useState(formData.addr || '');
  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);

  const handleNext = () => {
    if (!name || !gender || !birth || !addr) {
      setConfirmSkipOpen(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        name,
        gender,
        birth,
        addr,
      }));
      onNext();
    }
  };

  const confirmAndProceed = () => {
    setFormData((prev) => ({
      ...prev,
      name: '',
      gender: '',
      birth: '',
      addr: '',
    }));
    setConfirmSkipOpen(false);
    onNext();
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>추가 정보를 입력해주세요</Typography>
      <Stack spacing={2}>
        <TextField
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <FormControl component="fieldset">
          <FormLabel component="legend">성별</FormLabel>
          <RadioGroup row value={gender} onChange={(e) => setGender(e.target.value)}>
            <FormControlLabel value="M" control={<Radio />} label="남성" />
            <FormControlLabel value="F" control={<Radio />} label="여성" />
          </RadioGroup>
        </FormControl>

        <TextField
          label="생년월일"
          type="date"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }} // ✅ label을 위로 올림
        />

        <TextField
          label="주소"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          fullWidth
        />

        <Stack direction="row" justifyContent="space-between" mt={2}>
          <Button variant="outlined" onClick={onBack}>이전</Button>
          <Button variant="contained" onClick={handleNext}>다음</Button>
        </Stack>
      </Stack>

      <Dialog open={confirmSkipOpen} onClose={() => setConfirmSkipOpen(false)}>
        <DialogTitle>알림</DialogTitle>
        <DialogContent>
          <Typography>
            이 정보는 마이페이지에서 나중에 입력하거나 수정하실 수 있습니다. 계속 진행할까요?
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

export default StepExtra;
