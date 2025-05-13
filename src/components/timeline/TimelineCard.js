import { Box, Typography, Paper, Chip } from '@mui/material';
import { ChatBubble, Notifications, AlternateEmail, Article } from '@mui/icons-material';

const typeMap = {
  FEED: { label: '피드', icon: <Article fontSize="small" />, color: 'primary' },
  COMMENT: { label: '댓글', icon: <ChatBubble fontSize="small" />, color: 'success' },
  MENTION: { label: '멘션', icon: <AlternateEmail fontSize="small" />, color: 'warning' },
  SYSTEM: { label: '시스템', icon: <Notifications fontSize="small" />, color: 'error' },
};

function TimelineCard({ item }) {
  const info = typeMap[item.type] || {};

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `5px solid ${info.color ? `${info.color}.main` : '#ccc'}`,
      }}
    >
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

      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
        {item.content}
      </Typography>

      {item.dusername && (
        <Typography variant="caption" color="text.secondary" mt={1}>
          {item.dusername} 님의 타임라인
        </Typography>
      )}
    </Paper>
  );
}

export default TimelineCard;
