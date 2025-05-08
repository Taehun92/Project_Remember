import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Button, TextField, Avatar, Typography
  } from '@mui/material';
  import { useState, useEffect } from 'react';
  import { formatDateOnly } from '../../utils/formatData';
  
  function EditDeceasedModal({ open, onClose, deceasedData }) {
    const [form, setForm] = useState({ ...deceasedData });
    const isEditMode = Boolean(form.DUSERID);
    const today = new Date().toISOString().split('T')[0];
  
    useEffect(() => {
      if (deceasedData) {
        setForm({ ...deceasedData });
      }
    }, [deceasedData]);
  
    const handleChange = (field, value) => {
      setForm(prev => ({ ...prev, [field]: value }));
    };
  
    const handleUpdate = async () => {
      try {
        const res = await fetch(`http://localhost:3005/deceased/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
  
        const result = await res.json();
  
        if (result.success) {
          alert('고인 정보가 수정되었습니다.');
          onClose();
        } else {
          alert('수정 실패: ' + result.message);
        }
      } catch (err) {
        console.error('고인 정보 수정 오류:', err);
        alert('서버 오류가 발생했습니다.');
      }
    };
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>고인 정보 수정</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            {/* 프로필 이미지 표시 */}
            <Box display="flex" justifyContent="center">
              <Avatar
                src={`http://localhost:3005/${form.IMG_PATH || 'default-deceased.png'}`}
                sx={{ width: 120, height: 120 }}
              />
            </Box>
  
            {/* 이름 */}
            <TextField
              label="이름"
              value={form.DUSERNAME || ''}
              onChange={(e) => handleChange('DUSERNAME', e.target.value)}
              fullWidth
              size="small"
              disabled={isEditMode}
            />
  
            {/* 생년월일 / 사망일 */}
            <Box display="flex" gap={2}>
              <TextField
                label="생년월일"
                type="date"
                value={formatDateOnly(form.DBIRTH || '')}
                onChange={(e) => handleChange('DBIRTH', e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: today }}
                disabled={isEditMode}
              />
              <TextField
                label="사망일"
                type="date"
                value={formatDateOnly(form.DEATH || '')}
                onChange={(e) => handleChange('DEATH', e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: today }}
                disabled={isEditMode}
              />
            </Box>
  
            {/* 성별 / 관계 */}
            <Box display="flex" gap={2}>
              <TextField
                label="성별"
                select
                fullWidth
                size="small"
                value={form.GENDER || ''}
                onChange={(e) => handleChange('GENDER', e.target.value)}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: true }}
                disabled={isEditMode}
              >
                <option value="">선택</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </TextField>
  
              <TextField
                label="관계"
                fullWidth
                size="small"
                value={form.RELATION || ''}
                onChange={(e) => handleChange('RELATION', e.target.value)}
              />
            </Box>
  
            {/* 장지 */}
            <TextField
              label="장지"
              fullWidth
              size="small"
              value={form.REST_PLACE || ''}
              onChange={(e) => handleChange('REST_PLACE', e.target.value)}
            />
  
            {/* 고인 소개 */}
            <TextField
              label="고인 소개"
              fullWidth
              multiline
              rows={3}
              size="small"
              value={form.CONTENTS || ''}
              onChange={(e) => handleChange('CONTENTS', e.target.value)}
            />
  
            {/* 외부 링크 */}
            <TextField
              label="외부 링크 (추모 영상 등)"
              fullWidth
              size="small"
              value={form.LINKED_URL || ''}
              onChange={(e) => handleChange('LINKED_URL', e.target.value)}
            />
  
            {/* 공개 범위 */}
            <TextField
              label="공개 범위"
              select
              fullWidth
              size="small"
              value={form.VISIBILITY || ''}
              onChange={(e) => handleChange('VISIBILITY', e.target.value)}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: true }}
            >
              <option value="">선택</option>
              <option value="PUBLIC">전체 공개</option>
              <option value="PRIVATE">비공개</option>
              <option value="FRIENDS">팔로워 공개</option>
            </TextField>
          </Box>
        </DialogContent>
  
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            저장
          </Button>
          <Button onClick={onClose}>취소</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  export default EditDeceasedModal;
  