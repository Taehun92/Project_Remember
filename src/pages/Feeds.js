// src/pages/Feeds.js
import React, { useEffect, useState } from 'react';
import { Container, Box, CircularProgress } from '@mui/material';
import FeedList from '../components/feed/FeedList';

export default function Feeds() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3005/feeds');
      if (!res.ok) throw new Error('피드 조회 실패');
      const { feeds: allFeeds } = await res.json();
      // 삭제된(feed.DELETEYN === 'Y') 것만 필터링
      setFeeds(allFeeds.filter(f => f.DELETEYN !== 'Y'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : (
        <FeedList feeds={feeds} onRefresh={fetchFeeds} />
      )}
    </Container>
  );
}
