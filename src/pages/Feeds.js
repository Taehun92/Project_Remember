import React, { useEffect, useState, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import FeedCard from '../components/feed/FeedCard';
import { Container, Box, Typography } from '@mui/material';

export default function Feeds() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.userId;
    } catch {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken();

  const fetchFeeds = useCallback(async () => {
    if (loading || !hasMore || !currentUserId) return;

    setLoading(true);

    const lastFeedId = feeds.length > 0 ? feeds[feeds.length - 1].feedId : 2147483647;

    const params = new URLSearchParams({
      userId: currentUserId,
      size: 10
    });

    if (lastFeedId !== null) {
      params.append('lastFeedId', lastFeedId);
    }

    try {
      const res = await fetch(`http://localhost:3005/feeds/list?${params}`);
      const data = await res.json();

      if (data.feeds && data.feeds.length > 0) {
        setFeeds(prev => [...prev, ...data.feeds]);
      }

      if (!data.hasMore || data.feeds.length < 10) {
        setHasMore(false);
      }

      console.log("list 데이터",data);
    } catch (err) {
      console.error('❌ 피드 불러오기 실패:', err);
    }

    setLoading(false);
  }, [feeds, currentUserId, hasMore, loading, setFeeds, setHasMore, setLoading]); // ✅ 모든 사용 변수 포함

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]); // ✅ 의존성 추가 

  // IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchFeeds();
        }
      },
      { threshold: 1.0 }
    );

    const target = observerRef.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchFeeds]);

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 2 }}>
        {feeds.map(feed => (
          <FeedCard key={feed.feedId} feed={feed} />
        ))}

        {hasMore && <div ref={observerRef} style={{ height: '1px' }}></div>}
        {loading && <Typography align="center">로딩 중...</Typography>}
        {!hasMore && feeds.length > 0 && (
          <Typography align="center">📌 더 이상 피드가 없습니다.</Typography>
        )}
        {!currentUserId && (
          <Typography align="center">❗ 로그인 후 이용해주세요.</Typography>
        )}
      </Box>
    </Container>
  );
}
