import React, { useEffect, useState } from 'react';
import {
  Drawer,
  List,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Box,
  Button,
  Divider,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Home, Add, AccountCircle, Logout } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useRecoilState } from 'recoil';
import { userProfileState } from '../state/userProfile';
import FeedModal from '../components/feed/FeedModal';

export default function Menu() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [profile, setProfile] = useRecoilState(userProfileState);
  const [successOpen, setSuccessOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : {};
  const userId = decoded.userId;
  const userName = decoded.userName || '사용자';

  const [feedOpen, setFeedOpen] = useState(false);

  const handleOpenFeed = () => {
    setFeedOpen(true);
  };
  const handleCloseFeed = () => {
    setFeedOpen(false);
  };

  // 프로필 불러오기
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3005/user/info/${userId}`)
      .then(res => res.json())
      .then(data => setProfile(data.info))
      .catch(err => console.error('Menu fetch profile failed:', err));
  }, [userId, setProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // avatar src 조합
  const imgUrl = profile.IMG_PATH && profile.IMG_NAME
    ? `http://localhost:3005${profile.IMG_PATH}${profile.IMG_NAME}`
    : undefined;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ px: 1, pt: 2, pb: 3 }}>
        <Box display="flex" justifyContent="flex-end" sx={{ mb: 6 }}>
          <Button
            onClick={() => setConfirmOpen(true)}
            startIcon={<Logout />}
            sx={{
              color: 'error.main', fontSize: 12, p: 0,
              '&:hover': { color: 'error.dark', fontWeight: 'bold', backgroundColor: 'transparent' }
            }}
          >
            로그아웃
          </Button>
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Avatar src={imgUrl} sx={{ width: 56, height: 56 }}>{!imgUrl && userName[0]}</Avatar>
          <Typography variant="subtitle1" fontWeight="bold">
            {userName} 님
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.4 }}>
            오늘도 소중한 기억을<br />이어주셔서 감사합니다.
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Typography variant="h6" sx={{ p: 2 }}>SNS 메뉴</Typography>

      <List>
        <ListItemButton component={Link} to="/feeds">
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="피드" />
        </ListItemButton>
        <ListItemButton onClick={handleOpenFeed}>
          <ListItemIcon><Add /></ListItemIcon>
          <ListItemText primary="피드 등록" />
        </ListItemButton>
        <ListItemButton component={Link} to="/mypage">
          <ListItemIcon><AccountCircle /></ListItemIcon>
          <ListItemText primary="마이페이지" />
        </ListItemButton>
      </List>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>로그아웃 하시겠습니까?</DialogTitle>
        <DialogContent>
          <Typography>현재 계정에서 로그아웃됩니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>취소</Button>
          <Button onClick={handleLogout} size="small" color="error" variant="contained">
            로그아웃
          </Button>
        </DialogActions>
      </Dialog>

      {/* FeedModal */}
      <FeedModal
        open={feedOpen}
        onClose={handleCloseFeed}
        onSuccess={() => setSuccessOpen(true)}
      />

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)}>
        <DialogTitle>✅ 피드 등록 완료</DialogTitle>
        <DialogContent>
          <Typography>피드가 성공적으로 등록되었습니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessOpen(false)} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
