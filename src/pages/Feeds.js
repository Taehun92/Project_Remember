import React, { useEffect, useState, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import FeedCard from '../components/feed/FeedCard';
import FeedDetailModal from '../components/feed/FeedDetailModal';
import { Container, Box, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom'; // 또는 useParams

export default function Feeds() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [searchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag'); // ex) "여행"
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

    if (lastFeedId) params.append('lastFeedId', lastFeedId);
    if (selectedTag) params.append('tag', selectedTag);

    try {
      const res = await fetch(`http://localhost:3005/feeds/list?${params}`);
      const data = await res.json();

      if (data.feeds && data.feeds.length > 0) {
        setFeeds(prev => [...new Map([...prev, ...data.feeds].map(f => [f.feedId, f])).values()]);
      }

      if (!data.hasMore || data.feeds.length < 10) setHasMore(false);

    } catch (err) {
      console.error('❌ 피드 불러오기 실패:', err);
    }

    setLoading(false);
  }, [feeds, currentUserId, hasMore, loading, selectedTag]);


  console.log("feeds", feeds);


  // 댓글 입력 후
  const handleCommentAdded = (feedId) => {
    setFeeds(prev =>
      prev.map(f =>
        f.feedId === feedId
          ? { ...f, commentCount: (f.commentCount || 0) + 1 }
          : f
      )
    );
  };

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
          <FeedCard
            key={feed.feedId}
            feed={feed}
            onClick={() => {
              setSelectedFeed(feed);
              setOpenDetail(true);
            }}
            commentCount={feed.commentCount || 0}
            likeCount={feed.likeCount || 0}
            likedByMe={feed.liked_by_me || false}
          />
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
      <FeedDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        feedInfo={selectedFeed}
        imgList={selectedFeed?.images || []}
        onCommentAdded={handleCommentAdded}
      />
    </Container>
  );
}
