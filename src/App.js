import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';

import Menu from './pages/Menu';
import Login from './pages/Login';
import Feeds from './pages/Feeds';
import MyPage from './pages/MyPage';
import DeceasedPage from './pages/DeceasedPage';
import DMPage from './pages/DMPage';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/join' || location.pathname === '/';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isAuthPage && <Menu />} {/* 로그인과 회원가입 페이지가 아닐 때만 Menu 렌더링 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/feeds" element={<Feeds />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/:userId" element={<MyPage />} />
          <Route path="/deceased/:duserId" element={<DeceasedPage />} />
          <Route path="/dm" element={<DMPage />} />
          <Route path="/dm/:targetId" element={<DMPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
