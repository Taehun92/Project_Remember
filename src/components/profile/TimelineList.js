import { Box, Typography, Paper, Chip } from '@mui/material';
import { ChatBubble, Notifications, AlternateEmail, Article } from '@mui/icons-material';

const typeMap = {
  feed: { label: '피드', icon: <Article fontSize="small" />, color: 'primary' },
  comment: { label: '댓글', icon: <ChatBubble fontSize="small" />, color: 'success' },
  mention: { label: '멘션', icon: <AlternateEmail fontSize="small" />, color: 'warning' },
  system: { label: '시스템', icon: <Notifications fontSize="small" />, color: 'error' },
};

function TimelineList({ data = [] }) {
  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" mt={2}>
        타임라인 기록이 없습니다.
      </Typography>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>타임라인</Typography>
      {data.map((item) => {
        const info = typeMap[item.type] || {};
        return (
          <Paper
            key={item.timelineno}
            sx={{
              p: 2,
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: `5px solid ${info.color ? `${info.color}.main` : '#ccc'}`
            }}
          >
            {/* 상단: 타입 + 시간 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Chip
                label={info.label || item.type}
                icon={info.icon}
                color={info.color || 'default'}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                {new Date(item.created_at).toLocaleString()}
              </Typography>
            </Box>

            {/* 본문 */}
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {item.content}
            </Typography>

            {/* 고인 이름 (optional) */}
            <Typography variant="caption" color="text.secondary" mt={1}>
              {item.dusername} 님의 타임라인
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}

export default TimelineList;
