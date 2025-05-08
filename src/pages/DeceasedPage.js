// src/pages/DeceasedPage.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Typography,
  Button,
  Box,
  CircularProgress,
  Container
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

import EditDeceasedModal from '../components/profile/EditDeceasedModal';
import DeceasedProfileCard from '../components/profile/DeceasedProfileCard';
import FollowerList from '../components/profile/FollowerList';
import TimelineList from '../components/profile/TimelineList';
import MentionedFeedList from '../components/profile/MentionedFeedList';
import UserTagSearch from '../components/common/UserTagSearch';
import { formatDateOnly } from '../utils/formatData';

function DeceasedPage() {
  const { duserId } = useParams();
  const [deceased, setDeceased] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.userId;

  useEffect(() => {
    const fetchFullDeceased = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3005/deceased/${duserId}`);
        const data = await res.json();
        setDeceased(data.deceased);
        setFollowers(data.followers || []);
        setTimeline(data.timeline || []);
        setMentions(data.mentions || []);
      } catch (err) {
        console.error('❌ 데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullDeceased();
  }, [duserId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {deceased && (
        <DeceasedProfileCard
          data={{ ...deceased, followersCount: followers.length }}
          myUserId={userId}
          onEdit={() => setEditOpen(true)}
          onRequestChange={() => setManagerModalOpen(true)}
        />
      )}
      <FollowerList followers={followers} />
      <TimelineList data={timeline} />
      <MentionedFeedList data={mentions} />

      <EditDeceasedModal
        open={editOpen}
        onClose={()=>{setEditOpen(false)}}
        deceasedData={deceased}
      />

      <Dialog
        open={managerModalOpen}
        onClose={() => setManagerModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>관리자 변경 신청</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <Avatar
              src={`http://localhost:3005/${deceased.IMG_PATH || 'default-deceased.png'}`}
              sx={{ width: 80, height: 80 }}
            />
            <Box>
              <Typography variant="h6">{deceased.DUSERNAME}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateOnly(deceased.DBIRTH)} ~ {formatDateOnly(deceased.DEATH)}
              </Typography>
            </Box>
          </Box>
          <UserTagSearch
            value={selectedUser}
            onChange={setSelectedUser}
            label="신청할 사용자 태그네임"
          />
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              if (!selectedUser) {
                alert('신청할 사용자를 선택하세요.');
                return;
              }
              try {
                const res = await fetch('/deceased/request-change', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    duserId: deceased.DUSERID,
                    fromUserId: userId,
                    toUserId: selectedUser.USERID,
                  }),
                });
                const result = await res.json();
                if (result.success) {
                  alert('신청 완료!');
                  setManagerModalOpen(false);
                } else {
                  alert('신청 실패: ' + result.message);
                }
              } catch (err) {
                console.error('신청 중 오류:', err);
                alert('서버 오류 발생');
              }
            }}
          >
            신청
          </Button>
          <Button onClick={() => setManagerModalOpen(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DeceasedPage;
