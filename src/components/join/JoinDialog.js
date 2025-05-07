import React, { useState,useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  MobileStepper,
  Box,
  IconButton,
  Button,
  Typography,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import StepId from './steps/StepId';
import StepPassword from './steps/StepPassword';
import StepEmail from './steps/StepEmail';
import StepPhone from './steps/StepPhone';
import StepExtra from './steps/StepExtra';
import StepAgreement from './steps/StepAgreement';

function JoinDialog({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const steps = [
    StepId,
    StepPassword,
    StepEmail,
    StepPhone,
    StepExtra,
    StepAgreement,
  ];

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setFormData({});
      setShowSuccess(false);
    }
  }, [open]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = (finalData) => {
    const payload = {
      loginId: finalData.loginId,
      password: finalData.password,
      email: finalData.email,
      email_verified: finalData.emailVerified ? 'Y' : 'N',
      phone: finalData.phone,
      phone_verified: finalData.phoneVerified ? 'Y' : 'N',
      userName: finalData.name,
      birth: finalData.birth,
      gender: finalData.gender,
      addr: finalData.addr,
      marketing: finalData.agreement?.marketing ? 'Y' : 'N',
    };
    console.log(payload);
    
    fetch('http://localhost:3005/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShowSuccess(true); // 가입 완료 다이얼로그 띄우기
        } else {
          alert(data.message || '회원가입에 실패했습니다.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('네트워크 오류가 발생했습니다.');
      });
  };











  const CurrentStep = steps[activeStep];

  return (
    <>
      {/* ✅ 축하 다이얼로그 (회원가입 완료 시) */}
      {showSuccess && (
        <Dialog open={showSuccess} onClose={() => { }}>
          <DialogTitle>🎉 회원가입 완료</DialogTitle>
          <DialogContent>
            <Typography>
              회원가입을 축하드립니다! 이제 로그인하여 서비스를 이용해보세요.
            </Typography>
          </DialogContent>
          <DialogActions>
            <IconButton
              variant="contained"
              onClick={() => {
                setShowSuccess(false);
                onClose(); // 메인 회원가입 다이얼로그 닫기
              }}
            >
              확인
            </IconButton>
          </DialogActions>
        </Dialog>
      )}

      {/* ✅ 메인 회원가입 스텝 다이얼로그 */}
      <Dialog
        open={open}
        onClose={() => { }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          회원가입
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
              minWidth: 'unset',
              padding: '8px',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent', // 배경색 유지
                color: (theme) => theme.palette.grey[800], // X 색상만 진하게 변경
              },
            }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent>
          <CurrentStep
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
          />

          <Box mt={3} display="flex" justifyContent="center">
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              backButton={null}
              nextButton={null}
              sx={{ background: 'transparent', boxShadow: 'none' }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default JoinDialog;
