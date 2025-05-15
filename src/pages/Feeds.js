import React, { useEffect, useState, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import FeedCard from '../components/feed/FeedCard';
import FeedDetailModal from '../components/feed/FeedDetailModal';
import { Container, Box, Typography } from '@mui/material';
import { useSearchParams, useLocation } from 'react-router-dom'; // 또는 useParams

export default function Feeds() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [highlightedFeedId, setHighlightedFeedId] = useState(null);
  const [searchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag'); // ex) "여행"
  const location = useLocation();
  const scrollToFeedId = location.state?.scrollToFeedId;
  const feedRefs = useRef({});
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

  const handleOpenDetail = (feed) => {
    setSelectedFeed(feed);     // 최신 liked, likeCount 포함된 상태로 설정
    setOpenDetail(true);
  };



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

  // 마이페이지에서 피드 찾아 이동 / 강조
  useEffect(() => {
    if (scrollToFeedId && feedRefs.current[scrollToFeedId]) {
      const el = feedRefs.current[scrollToFeedId];
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // 강조 효과 부여
      setHighlightedFeedId(scrollToFeedId);

      // 일정 시간 후 강조 제거
      setTimeout(() => setHighlightedFeedId(null), 2000);
    }
  }, [feeds, scrollToFeedId]);

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 2 }}>
        {feeds.map(feed => (
          <FeedCard
            key={feed.feedId}
            feed={feed}
            commentCount={feed.commentCount}
            ref={(el) => {
              if (el) feedRefs.current[feed.feedId] = el;
            }}
            onOpenDetail={handleOpenDetail}
            highlighted={feed.feedId === highlightedFeedId}
            onLikeChange={(updatedLikeData) => {
              setFeeds(prev =>
                prev.map(f =>
                  f.feedId === feed.feedId
                    ? { ...f, ...updatedLikeData }
                    : f
                )
              );

              // 현재 모달에 열려 있는 피드라면 그것도 업데이트
              if (selectedFeed?.feedId === feed.feedId) {
                setSelectedFeed(prev => ({ ...prev, ...updatedLikeData }));
              }
            }}
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
        key={selectedFeed?.feedId}  // ← feedId를 key로 설정
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        feedInfo={selectedFeed}
        imgList={selectedFeed?.images || []}
        onDeleteFeed={(deletedId) => {
          setFeeds(prev => prev.filter(f => f.feedId !== deletedId));
        }}
      />
    </Container>
  );
}
