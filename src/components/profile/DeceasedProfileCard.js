import { Box, Avatar, Typography, Paper, Button } from '@mui/material';
import { useState } from 'react';
import FollowButton from '../follow/FollowButton';

function DeceasedProfileCard({ data, myUserId, onEdit, onRequestChange }) {
  const [isRequestPending, setIsRequestPending] = useState(false);

  if (!data) return null;
  const {
    DUSERNAME, IMG_PATH, IMG_NAME,
    DBIRTH, DEATH, REST_PLACE,
    PRIMARY_USERID, AGENT_USERID, DUSERID
  } = data;

  const imgUrl = IMG_PATH && IMG_NAME
    ? `http://localhost:3005${IMG_PATH}${IMG_NAME}`
    : '/default-deceased.png';

  const isManager = (PRIMARY_USERID === myUserId || AGENT_USERID === myUserId);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'relative',   // ← 부모에 position: relative 반드시!
        p: 3,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        mb: 4,
        maxWidth: 800,
        margin: '0 auto',
        minHeight: 150
      }}
    >
      {/* 프로필 이미지 */}
      <Avatar src={imgUrl} alt={DUSERNAME} sx={{ width:100, height:100 }} />

      {/* 고인 정보 */}
      <Box flex={1}>
        <Typography variant="h5" fontWeight="bold">{DUSERNAME}</Typography>
        <Typography color="text.secondary" mb={1}>
          {DBIRTH?.slice(0,4)} ~ {DEATH?.slice(0,4)}
        </Typography>
        <Typography variant="body2">
          안식처: {REST_PLACE || '정보 없음'}
        </Typography>
      </Box>

      {/* 1) 관리자인 경우 "정보 수정" 버튼 */}
      {isManager && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => onEdit(true)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            minWidth: 80
          }}
        >
          정보 수정
        </Button>
      )}

      {/* 2) 일반 유저인 경우 "팔로우/언팔로우" 버튼 */}
      {!isManager && (
        <FollowButton
          myUserId={myUserId}
          targetUserId={DUSERID}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            minWidth: 80
          }}
        />
      )}

       {/* 3) 관리자 변경 신청 버튼 */}
       {isManager && (
        <Button
          size="small"
          variant="text"
          disabled={isRequestPending}
          onClick={onRequestChange}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            color: isRequestPending ? 'text.secondary' : 'warning.main',
          }}
        >
          {isRequestPending ? '변경 요청 처리중' : '관리자 변경 신청'}
        </Button>
      )}
    </Paper>
  );
}

export default DeceasedProfileCard;
