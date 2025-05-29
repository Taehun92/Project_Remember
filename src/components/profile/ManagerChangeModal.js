// src/components/profile/ManagerChangeModal.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Avatar, Typography, Button
} from '@mui/material';
import UserTagSearch from '../common/UserTagSearch'; // 사용자 검색 컴포넌트 경로에 맞게 조정하세요
import { formatDateOnly } from '../../utils/formatData';
import { useState } from 'react';

export default function ManagerChangeModal({ open, onClose, deceased, userId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  console.log("deceased",deceased);
  
  // 고인 관리자 변경
  const handleSubmit = async () => {
    if (!selectedUser) {
      alert('신청할 사용자를 선택하세요.');
      return;
    }
    try {
      const res = await fetch('/deceased/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duserId: deceased.duserId,
          fromUserId: userId,
          toUserId: selectedUser.userId,
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert('신청 완료!');
        onClose();
      } else {
        alert('신청 실패: ' + result.message);
      }
    } catch (err) {
      console.error('신청 중 오류:', err);
      alert('서버 오류 발생');
    }
  };

  if (!deceased) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>관리자 변경 신청</DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <Avatar
            src={`http://localhost:3005${deceased.img_path}${deceased.img_name}`}
            sx={{ width: 80, height: 80 }}
          />
          <Box>
            <Typography variant="h6">{deceased.duserName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDateOnly(deceased.dbirth)} ~ {formatDateOnly(deceased.death)}
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
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          신청
        </Button>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
}
