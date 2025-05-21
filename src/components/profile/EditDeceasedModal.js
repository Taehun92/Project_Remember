import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, TextField
} from '@mui/material';
import ImageUploader from '../common/ImageUploader';
import { formatDateOnly } from '../../utils/formatData';

export default function EditDeceasedModal({ open, onClose, deceasedData, onUpdated }) {
  const [form, setForm] = useState({ ...deceasedData });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const isViewMode = Boolean(form.DUSERID);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (deceasedData) {
      setForm({ ...deceasedData });
      setSelectedFiles([]);
    }
  }, [deceasedData]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // 이미지 업로드
    if (selectedFiles.length > 0) {
      const imgForm = new FormData();
      imgForm.append('image', selectedFiles[0]);
      imgForm.append('id', form.DUSERID);
      try {
        const res = await fetch('http://localhost:3005/upload/deceased', {
          method: 'POST',
          body: imgForm
        });
        const data = await res.json();
        if (data.success) {
          form.IMG_PATH = data.filepath;
          form.IMG_NAME = data.filename;
        } else {
          alert('이미지 업로드 실패: ' + data.message);
          return;
        }
      } catch (err) {
        console.error(err);
        alert('이미지 서버 오류');
        return;
      }
    }

    // 정보 업데이트
    try {
      const payload = {
        ...form,
        DBIRTH: formatDateOnly(form.DBIRTH),
        DEATH: formatDateOnly(form.DEATH),
      };
      const res = await fetch('http://localhost:3005/deceased/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        alert('고인 정보가 수정되었습니다.');
        onUpdated && onUpdated(form.DUSERID, {
          IMG_PATH: form.IMG_PATH,
          IMG_NAME: form.IMG_NAME
        });
        onClose();
      } else {
        alert('수정 실패: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>고인 정보 수정</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" mt={2} mb={3}>
          <ImageUploader
            currentImages={[`http://localhost:3005${form.IMG_PATH}${form.IMG_NAME}`]}
            multiple={false}
            onFilesSelected={setSelectedFiles}
          />
        </Box>

        {/* 고인 세부 정보 폼 */}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="이름"
            fullWidth
            size="small"
            value={form.DUSERNAME || ''}
            onChange={e => handleChange('DUSERNAME', e.target.value)}
            disabled={isViewMode}
          />
          <Box display="flex" gap={2}>
            <TextField
              label="생년월일"
              type="date"
              fullWidth size="small"
              value={formatDateOnly(form.DBIRTH || '')}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
              onChange={e => handleChange('DBIRTH', e.target.value)}
              disabled={isViewMode}
            />
            <TextField
              label="사망일"
              type="date"
              fullWidth size="small"
              value={formatDateOnly(form.DEATH || '')}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
              onChange={e => handleChange('DEATH', e.target.value)}
              disabled={isViewMode}
            />
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              label="성별"
              select
              fullWidth size="small"
              value={form.GENDER || ''}
              onChange={e => handleChange('GENDER', e.target.value)}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: true }}
              disabled={isViewMode}
            >
              <option value="">선택</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </TextField>
            <TextField
              label="관계"
              fullWidth size="small"
              value={form.RELATION || ''}
              onChange={e => handleChange('RELATION', e.target.value)}
            />
          </Box>
          <TextField
            label="장지"
            fullWidth size="small"
            value={form.REST_PLACE || ''}
            onChange={e => handleChange('REST_PLACE', e.target.value)}
          />
          <TextField
            label="고인 소개"
            fullWidth multiline rows={3} size="small"
            value={form.CONTENTS || ''}
            onChange={e => handleChange('CONTENTS', e.target.value)}
          />
          <TextField
            label="외부 링크 (추모 영상 등)"
            fullWidth size="small"
            value={form.LINKED_URL || ''}
            onChange={e => handleChange('LINKED_URL', e.target.value)}
          />
          <TextField
            label="공개 범위"
            select
            fullWidth size="small"
            value={form.VISIBILITY || ''}
            onChange={e => handleChange('VISIBILITY', e.target.value)}
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
      <DialogActions sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>저장</Button>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
}