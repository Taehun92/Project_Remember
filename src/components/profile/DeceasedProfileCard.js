import { Box, Avatar, Typography, Paper, Button } from '@mui/material';
import { useState } from 'react';

function DeceasedProfileCard({ data, myUserId, onEdit, onRequestChange }) {
  const [isRequestPending, setIsRequestPending] = useState(false);

  if (!data) return null;
  console.log("고인정보", data);
  console.log("고인정보", myUserId);
  const {
    DUSERNAME,
    IMG_PATH,
    DBIRTH,
    DEATH,
    REST_PLACE,
  } = data;

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        mb: 4,
        maxWidth: 800,
        margin: '0 auto',
        position: 'relative',
        minHeight: 150, // 여유 공간 확보용
      }}
    >
      {/* 프로필 이미지 */}
      <Avatar
        src={`http://localhost:3005/${IMG_PATH || 'default-deceased.png'}`}
        alt={DUSERNAME}
        sx={{ width: 100, height: 100 }}
      />

      {/* 고인 정보 */}
      <Box>
        {/* 우측 상단 정보 수정 버튼 */}
        {(data.PRIMARY_USERID === myUserId || data.AGENT_USERID === myUserId) && (
          <Button
            size="small"
            variant="outlined"
            sx={{ position: 'absolute', top: 16, right: 16 }}
            onClick={() => onEdit(true)}
          >
            정보 수정
          </Button>
        )}

        <Typography variant="h5" fontWeight="bold">{DUSERNAME}</Typography>
        <Typography color="text.secondary" mb={1}>
          {DBIRTH?.slice(0, 4)} ~ {DEATH?.slice(0, 4)}
        </Typography>
        <Typography variant="body2">안식처: {REST_PLACE || '정보 없음'}</Typography>
      </Box>

      {/* ✅ 우측 하단 관리자 변경 신청 버튼 */}
      <Button
        size="small"
        variant="text"
        disabled={isRequestPending}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: 'transparent',
          color: isRequestPending ? 'text.secondary' : 'warning.main',
          '&:hover': {
            backgroundColor: 'transparent',
            color: isRequestPending ? 'text.secondary' : 'error.main',
          },
        }}
        onClick={onRequestChange} // ✅ 여기에 연결만 하면 끝!
      >
        {isRequestPending ? '변경 요청 처리중' : '관리자 변경 신청'}
      </Button>
    </Paper >
  );
}

export default DeceasedProfileCard;
