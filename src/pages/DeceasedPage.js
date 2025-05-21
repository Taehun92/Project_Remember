// src/pages/DeceasedPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

import DeceasedProfileCard from '../components/profile/DeceasedProfileCard';
import FollowerList from '../components/follow/FollowerList';
import EditDeceasedModal from '../components/profile/EditDeceasedModal';
import ManagerChangeModal from '../components/profile/ManagerChangeModal';
import NewsFeedCard from '../components/feed/NewsFeedCard';
import { cardSection } from '../components/common/styles';


function DeceasedPage() {
  const { duserId } = useParams();
  const [deceased, setDeceased] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.userId;

  // 1) 모든 데이터를 가져오는 함수
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 고인 정보
      const res1 = await fetch(`http://localhost:3005/deceased/${duserId}/info`);
      if (!res1.ok) throw new Error('고인 정보 조회 실패');
      const { deceased: d } = await res1.json();
      setDeceased(d);

      // 팔로워 목록
      const res2 = await fetch(`http://localhost:3005/follow/${duserId}/followers`);
      if (!res2.ok) throw new Error('팔로워 목록 조회 실패');
      const { followers: f } = await res2.json();
      setFollowers(f);

      // 타임라인
      const res3 = await fetch(`http://localhost:3005/deceased/${duserId}/timeline`);
      if (!res3.ok) throw new Error('타임라인 조회 실패');
      const { timeline: t } = await res3.json();
      setTimeline(t);

      // 멘션 피드
      const res4 = await fetch(`http://localhost:3005/deceased/${duserId}/mentions`);
      if (!res4.ok) throw new Error('멘션 피드 조회 실패');
      const { mentions: m } = await res4.json();
      setMentions(m);

      // 5) 뉴스피드 로그
      const res5 = await fetch(`http://localhost:3005/newsfeed?duserId=${duserId}`);
      if (!res5.ok) throw new Error('뉴스피드 로그 조회 실패');
      const logData = await res5.json();
      setLogs(Array.isArray(logData) ? logData : logData.data || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [duserId]);

  // 마운트 및 duserId 변경 시 fetchData 호출
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 로딩 / 에러 처리
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box mt={5} textAlign="center">
        <Typography color="error">에러: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* 고인 프로필 카드 */}
      {deceased && (
        <DeceasedProfileCard
          data={deceased}
          myUserId={userId}
          onEdit={() => setEditOpen(true)}
          onRequestChange={() => setManagerModalOpen(true)}
        />
      )}

      {/* 편집 모달: onUpdated에서 fetchData를 다시 호출 */}
      <EditDeceasedModal
        open={editOpen}
        onClose={() => {
          console.log('❌ 모달 닫힘 요청됨');
          setEditOpen(false);
        }}
        deceasedData={deceased}
        onUpdated={() => {
          console.log('✅ 정보 수정 완료, 모달 닫기');
          setEditOpen(false);
          fetchData();
        }}
      />

      <ManagerChangeModal
        open={managerModalOpen}
        onClose={() => setManagerModalOpen(false)}
        deceased={deceased}
        userId={userId}
      />


      {/* 팔로워 섹션 */}
      <Paper {...cardSection}>
        <Typography variant="h6" sx={{ p: 2, maxWidth: 800, width: '100%', mx: 'auto' }}>
          팔로워 목록
        </Typography>
        <FollowerList followers={followers} onUserClick={id => navigate(`/myPage/${id}`)} />

        {/* 타임라인 & 멘션피드 섹션 */}
        {logs.length > 0 && (
          <Box
            variant="outlined"
            sx={{ mt: 3, p: 2, maxWidth: 800, width: '100%', mx: 'auto' }}
          >
            <Typography variant="h6" gutterBottom>
              최근 활동 소식
            </Typography>
            {logs.map((log) => (
              <NewsFeedCard
                key={log.logId}
                log={log}
                onClick={() => {
                  if (log.source) {
                    const feedId = log.source.feedId || log.source.id;
                    if (feedId) {
                      navigate('/feeds', {
                        state: { scrollToFeedId: feedId }
                      });
                    }
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default DeceasedPage;
