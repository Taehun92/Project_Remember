import { Box, Typography } from '@mui/material';
import TimelineCard from './TimelineCard';

function DeceasedTimeline({ data = [] }) {
  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>고인 타임라인</Typography>
      {data.length === 0 ? (
        <Typography color="text.secondary">기록이 없습니다.</Typography>
      ) : (
        data.map(item => <TimelineCard key={item.timelineno} item={item} />)
      )}
    </Box>
  );
}

export default DeceasedTimeline;
