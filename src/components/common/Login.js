import React, { useState } from 'react';
import { Container, Box, Card, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton, Input, InputLabel, FormControl } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  LoginCard,
  LogoBox,
  LogoText,
  LogoBar,
  LinkRow,
  StyledLink
} from './LoginStyled';
import JoinDialog from '../join/JoinDialog';

function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };


  const handleLogin = () => {

    fetch("http://localhost:3005/user/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({ loginId, pwd: password })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.success) {
          setDialogMessage(data.message);
          localStorage.setItem("token", data.token);
          navigate("/feed");
        } else {
          setDialogMessage(data.message);
        }
        setDialogOpen(true);
      })
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Card sx={{
          p: 4,
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <LoginCard>
            <LogoBox>
              <LogoText variant="h4" gutterBottom color="#000">Re:member</LogoText>
              <LogoBar />
            </LogoBox>

            <Box component="form" noValidate autoComplete="off">
              <Stack spacing={3}>
                <TextField
                  id="input-with-icon-textfield"
                  label=" 아이디"
                  variant="standard"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                />
                <FormControl sx={{ m: 1 }} variant="standard">
                  <InputLabel htmlFor="standard-adornment-password">비밀번호</InputLabel>
                  <Input
                    id="standard-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                          }
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          onMouseUp={handleMouseUpPassword}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleLogin}
                >
                  로그인
                </Button>
              </Stack>
            </Box>
            <LinkRow direction="row" spacing={3} justifyContent="center" alignItems="center" >
              <Link
                component="button"
                variant="body2"
                onClick={() => setJoinOpen(true)}
              >
                회원가입
              </Link>
              <JoinDialog open={joinOpen} onClose={() => setJoinOpen(false)} />
              <Typography variant="body2" color="text.secondary">|</Typography>
              <StyledLink href="#">비밀번호 찾기</StyledLink>
            </LinkRow>
          </LoginCard>
        </Card>
      </Box>

      {/* 로그인 결과 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>알림</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>확인</Button>
        </DialogActions>
      </Dialog>
    </Container>
    
  );
}

export default Login;
