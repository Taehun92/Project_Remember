// src/components/follow/FollowerList.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Button,
  Tooltip
} from '@mui/material';

const itemStyle = {
  cursor: 'pointer',
  textAlign: 'center',
  width: 80,
  p: 1,
  m: 1,
};

export default function FollowerList({ followers, onUserClick }) {
  const [open, setOpen] = useState(false);
  const preview = followers.slice(0, 5);
  const navigate = useNavigate();

  const renderItem = u => {
    const imgUrl = u.img_path && u.img_name
      ? `http://localhost:3005${u.img_path}${u.img_name}`
      : '/default-profile.png';

    return (
      <Paper
        key={u.userId}
        elevation={1}
        sx={itemStyle}
        onClick={() => onUserClick ? onUserClick(u.userId) : navigate(`/deceased/${u.userId}`)}
      >
        <Avatar src={imgUrl} sx={{ width: 56, height: 56, mx: 'auto' }} />

        {/* ✅ USERNAME 툴팁 처리 */}
        <Tooltip title={u.username}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              mt: 0.5,
              letterSpacing: '0.05em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              maxWidth: '100%',
            }}
          >
            {u.username}
          </Typography>
        </Tooltip>

        {/* ✅ TAGNAME 툴팁 유지 */}
        <Tooltip title={u.tagname}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              maxWidth: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              display: 'block',
              textAlign: 'center'
            }}
          >
            {u.tagname}
          </Typography>
        </Tooltip>
      </Paper>
    );
  };

  return (
    <>
      {/* 프리뷰 */}
      <Box sx={{ display: 'flex', overflowX: 'auto', alignItems: 'center' }}>
        {preview.map(renderItem)}
        {followers.length > 5 && (
          <Paper elevation={1} sx={itemStyle} onClick={() => setOpen(true)}>
            <Avatar sx={{ width: 56, height: 56, mx: 'auto', bgcolor: 'grey.200' }}>…</Avatar>
            <Typography variant="subtitle2">더보기</Typography>
          </Paper>
        )}
      </Box>

      {/* 모달 전체 리스트 */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>팔로워 전체 목록</DialogTitle>
        <DialogContent dividers>
          {followers.length === 0
            ? <Typography>팔로워가 없습니다.</Typography>
            : <Grid container justifyContent="center">
              {followers.map(renderItem)}
            </Grid>
          }
        </DialogContent>
        <Box textAlign="right" p={1}>
          <Button onClick={() => setOpen(false)}>닫기</Button>
        </Box>
      </Dialog>
    </>
  );
}

