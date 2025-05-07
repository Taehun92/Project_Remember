// src/components/join/steps/StepAgreement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
} from '@mui/material';

function StepAgreement({ onBack, onSubmit, formData }) {
  const [checked, setChecked] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false, // 선택 사항
  });

  // 전체 동의 토글 시 개별 항목 변경
  const handleAllChange = (event) => {
    const { checked } = event.target;
    setChecked({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  // 개별 체크박스 변경
  const handleChange = (event) => {
    const { name, checked: isChecked } = event.target;
    setChecked((prev) => ({
      ...prev,
      [name]: isChecked,
    }));
  };

  // 필수 항목이 모두 체크되었는지 확인
  const isRequiredChecked = checked.terms && checked.privacy;

  // 전체 체크 여부 반영
  useEffect(() => {
    const allChecked = checked.terms && checked.privacy && checked.marketing;
    setChecked((prev) => ({ ...prev, all: allChecked }));
  }, [checked.terms, checked.privacy, checked.marketing]);

  const handleJoin = () => {
    if (!isRequiredChecked) return;

    onSubmit({
      ...formData,
      agreement: {
        terms: checked.terms,
        privacy: checked.privacy,
        marketing: checked.marketing,
      },
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>이용약관 동의</Typography>

      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={checked.all} onChange={handleAllChange} />}
          label="전체 동의"
        />
        <FormControlLabel
          control={<Checkbox checked={checked.terms} onChange={handleChange} name="terms" />}
          label="[필수] 이용약관 동의"
        />
        <FormControlLabel
          control={<Checkbox checked={checked.privacy} onChange={handleChange} name="privacy" />}
          label="[필수] 개인정보 수집 및 이용 동의"
        />
        <FormControlLabel
          control={<Checkbox checked={checked.marketing} onChange={handleChange} name="marketing" />}
          label="[선택] 마케팅 정보 수신 동의"
        />
      </FormGroup>

      <Stack direction="row" justifyContent="space-between" mt={4}>
        <Button variant="outlined" onClick={onBack}>이전</Button>
        <Button
          variant="contained"
          onClick={handleJoin}
          disabled={!isRequiredChecked}
        >
          회원가입
        </Button>
      </Stack>
    </Box>
  );
}

export default StepAgreement;
