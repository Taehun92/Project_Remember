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
  DialogActions,
  TextField,
  Autocomplete
} from '@mui/material';
import { Home, Add, AccountCircle, Logout, ChatBubble } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useRecoilState } from 'recoil';
import { userProfileState } from '../state/userProfile';
import FeedModal from '../components/feed/FeedModal';

export default function Menu() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [profile, setProfile] = useRecoilState(userProfileState);
  const [successOpen, setSuccessOpen] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [feedOpen, setFeedOpen] = useState(false);

  const navigate = useNavigate();


  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);

  const userId = decoded.userId;
  const userName = decoded.userName || '사용자';

  const handleOpenFeed = () => {
    setFeedOpen(true);
  };
  const handleCloseFeed = () => {
    setFeedOpen(false);
  };

  const handleUserSelect = (event, selectedUser) => {
    if (selectedUser) {
      navigate(`/myPage/${selectedUser.id}`);
    }
  };


  // 유저 검색
  useEffect(() => {
    if (!searchText.trim()) {
      setUserOptions([]);
      return;
    }

    console.log('🔍 검색 요청:', searchText); // ✅ 검색어 로그

    fetch(`http://localhost:3005/user/search-tag?tagName=${searchText}`)
      .then(res => res.json())
      .then(data => {
        console.log('📥 서버 응답:', data);
        const rawList = data.list || [];
        console.log('📊 원본 리스트:', rawList);

        const filtered = rawList.filter(user => {
          const keyword = searchText.toLowerCase();
          return (
            (user.TAGNAME || '').toLowerCase().includes(keyword) ||
            (user.USERNAME || '').toLowerCase().includes(keyword)
          );
        });

        console.log('✅ 최종 필터링 결과:', filtered);
        setUserOptions(filtered.map(user => ({
          id: `${user.type || 'user'}:${user.id}`,
          display: user.TAGNAME || user.USERNAME || user.DUSERNAME || '',
          userName: user.USERNAME || user.DUSERNAME || '',
          imgPath: user.IMG_PATH || '',
          imgName: user.IMG_NAME || '',
        })));
      })
      .catch(err => console.error('❌ 검색 실패:', err));
  }, [searchText]);

  // 프로필 불러오기
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3005/user/info/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log('👤 사용자 정보 응답:', data.info); // ✅ 확인
        setProfile(data.info)
      })

      .catch(err => console.error('Menu fetch profile failed:', err));
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // avatar src 조합
  const imgUrl = profile.img_path && profile.img_name
    ? `http://localhost:3005${profile.img_path}${profile.img_name}`
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

      <Box sx={{ px: 2, pb: 2, mt: 4 }}>
        <Autocomplete
          freeSolo
          filterOptions={(x) => x}
          options={userOptions}
          value={searchText} // ✅ 입력값 바인딩
          onInputChange={(_, value) => setSearchText(value)}
          onFocus={() => setSearchText('')} // ✅ 포커스 시 초기화
          onChange={(_, value) => {
            if (value?.id) {
              const [type, uid] = value.id.split(':');
              navigate(type === 'duser' ? `/deceased/${uid}` : `/mypage/${uid}`);
            }
          }}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : option.display || option.label || ''
          }
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option) => {
            if (!option || !option.id) return null;
            return (
              <Box component="li" {...props} key={option.id} display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={
                    option.imgPath && option.imgName
                      ? `http://localhost:3005${option.imgPath}${option.imgName}`
                      : '/default-profile.png'
                  }
                  sx={{ width: 32, height: 32 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {option.display}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.userName}
                  </Typography>
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="유저 검색"
              placeholder="@태그명 또는 이름"
              size="small"
              variant="outlined"
            />
          )}
        />
      </Box>
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
        <ListItemButton component={Link} to="/dm">
          <ListItemIcon><ChatBubble /></ListItemIcon>
          <ListItemText primary="DM" />
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
        onSuccess={() => {
          setSuccessOpen(true);
        }}
      />

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)}>
        <DialogTitle>✅ 피드 등록 완료</DialogTitle>
        <DialogContent>
          <Typography>피드가 성공적으로 등록되었습니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSuccessOpen(false);
              setFeedOpen(false);       // 피드 작성 모달도 닫기
              navigate('/feeds');       // ✅ /feeds 페이지로 이동
            }}
            autoFocus
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
