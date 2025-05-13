import React from 'react';
import TimelineCard from './TimelineCard';
import { Typography, Box } from '@mui/material';

export default function UserTimeline({ timelineList }) {
    if (!timelineList || timelineList.length === 0) {
        return <Typography color="text.secondary">타임라인이 아직 없습니다.</Typography>;
    }

    return (
        <Box>
            {timelineList.map(item => (
                <TimelineCard key={item.TIMELINENO} item={item} />
            ))}
        </Box>
    );
}
