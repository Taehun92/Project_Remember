import { Box, Avatar, Typography, Paper, Button } from '@mui/material';
import { useState } from 'react';
import FollowButton from '../follow/FollowButton';

function DeceasedProfileCard({ data, myUserId, onEdit, onRequestChange }) {
  const [isRequestPending, setIsRequestPending] = useState(false);

  if (!data) return null;
  const {
    duserName, img_path, img_name,
    dbirth, death, rest_place,
    primary_userId, agent_userId, duserId, dtagName
  } = data;

  const imgUrl = img_path && img_name
    ? `http://localhost:3005${img_path}${img_name}`
    : '/default-deceased.png';

  const isManager = (primary_userId === myUserId || agent_userId === myUserId);

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
      <Avatar src={imgUrl} alt={duserName} sx={{ width: 100, height: 100 }} />

      {/* 고인 정보 */}
      <Box flex={1}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" fontWeight="bold">{duserName}</Typography>
          {rest_place && (
            <Typography variant="body2" color="text.secondary">
              (안식처: {rest_place})
            </Typography>
          )}
        </Box>
        <Typography variant="h8" fontWeight="semibold" color="text.secondary" mb={1} >{dtagName} {dbirth?.slice(0, 4)} ~ {death?.slice(0, 4)}</Typography>

        {/* ✅ 고인 소개 */}
        <Typography
          variant="body1" // ← 글씨 크기
          fontWeight="bold" // ← 굵기 강조
          color="text.primary"
          sx={{ mt: 1, whiteSpace: 'pre-line' }}
        >
          {data.contents?.trim() ? data.contents : '소개가 등록되지 않았습니다.'}
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
          targetUserId={duserId}
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
          onClick={() => {
            console.log('🟡 관리자 변경 버튼 클릭됨');
            onRequestChange();
          }}
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
