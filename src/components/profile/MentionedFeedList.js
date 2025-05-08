// src/components/profile/MentionedFeedList.jsx
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Article, Comment } from '@mui/icons-material';

function MentionedFeedList({ data = [] }) {
  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" mt={2}>
        멘션된 피드가 없습니다.
      </Typography>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>멘션된 피드</Typography>
      {data.map((item) => (
        <Paper key={item.feedno || item.comment_id} sx={{ p: 2, mb: 2 }}>
          {/* 상단: 유형 / 시간 */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Chip
              label={item.type === 'FEED' ? '피드' : '댓글'}
              icon={item.type === 'FEED' ? <Article fontSize="small" /> : <Comment fontSize="small" />}
              color={item.type === 'FEED' ? 'primary' : 'secondary'}
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              {new Date(item.created_at).toLocaleString()}
            </Typography>
          </Box>

          {/* 내용 */}
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {item.content}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

export default MentionedFeedList;
