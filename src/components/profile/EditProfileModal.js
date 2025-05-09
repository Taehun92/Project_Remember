import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Button, TextField, Typography
} from '@mui/material';
import ImageUploader from '../common/ImageUploader';

export default function EditProfileModal({ open, onClose, userData, onUpdated }) {
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({ email: '', phone: '' });
    const [tagnameLock, setTagnameLock] = useState(false);
    const [tagnameCheck, setTagnameCheck] = useState({ valid: null, message: '' });
    const [selectedFiles, setSelectedFiles] = useState([]);

    // 초기 폼 세팅
    useEffect(() => {
        if (userData) {
            const birth = userData.BIRTH;
            let date = '';
            if (birth instanceof Date) date = birth.toISOString().split('T')[0];
            else if (typeof birth === 'string' && birth.includes('T')) date = birth.split('T')[0];
            else date = birth || '';

            const fullImg = (userData.IMG_PATH || '') + (userData.IMG_NAME || '');
            setForm({
                ...userData,
                TAGNAME: userData.TAGNAME?.replace(/^@/, ''),
                BIRTH: date,
                profileImg: fullImg       // <-- 경로+파일명 합쳐서 넣어줍니다
            });
            setErrors({ email: '', phone: '' });
            setTagnameLock(false);
            setTagnameCheck({ valid: null, message: '' });
            setSelectedFiles([]);
        }
    }, [userData]);

    // 태그네임 중복 확인
    const checkTagname = async () => {
        const raw = form.TAGNAME?.replace(/^@/, '');
        if (!raw) {
            setTagnameCheck({ valid: false, message: '태그네임을 입력하세요.' });
            return false;
        }
        try {
            const res = await fetch(`http://localhost:3005/join/tagName?tagName=${raw}`);
            const data = await res.json();
            if (!data.exists) {
                setTagnameCheck({ valid: true, message: '사용 가능한 태그네임입니다.' });
                return true;
            } else {
                setTagnameCheck({ valid: false, message: '이미 사용 중인 태그네임입니다.' });
                return false;
            }
        } catch {
            setTagnameCheck({ valid: false, message: '오류가 발생했습니다.' });
            return false;
        }
    };

    // 업데이트 처리
    const handleUpdate = async () => {
        // 이미지 업로드
        if (selectedFiles.length > 0) {
            const imgForm = new FormData();
            imgForm.append('image', selectedFiles[0]);
            imgForm.append('id', form.USERID);
            console.log([...imgForm.entries()]);

            try {
                const imgRes = await fetch('http://localhost:3005/upload/profile', {
                    method: 'POST',
                    body: imgForm
                });
                const imgData = await imgRes.json();
                if (imgData.success) {
                    form.profileImg = imgData.filepath + imgData.filename;
                } else {
                    alert('이미지 업로드 실패: ' + imgData.message);
                    return;
                }
            } catch {
                alert('이미지 서버 오류');
                return;
            }
        }
        // 태그네임 검사
        if (tagnameCheck.valid === false) {
            alert('태그네임 중복 확인을 해주세요.');
            return;
        }
        // 기본 정보 업데이트
        try {
            const res = await fetch('http://localhost:3005/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: form.USERID,
                    userName: form.USERNAME,
                    tagname: form.TAGNAME.startsWith('@') ? form.TAGNAME : '@' + form.TAGNAME,
                    email: form.EMAIL,
                    email_verified: form.EMAIL_VERIFIED,
                    phone: form.PHONE,
                    phone_verified: form.PHONE_VERIFIED,
                    birth: form.BIRTH,
                    gender: form.GENDER,
                    addr: form.ADDR
                })
            });
            const result = await res.json();
            console.log('▶ Update API response:', result);
            if (result.success) {
                alert('정보 수정이 완료되었습니다.');
                onUpdated && onUpdated({ ...form });
                onClose();
            } else {
                alert('수정 실패: ' + result.message);
            }
        } catch (err) {
            console.error('Update error ▶', err);
            alert('정보 수정 중 오류 발생:\n' + err.message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>정보 수정</DialogTitle>
            <DialogContent>
                {/* 이미지 선택 */}
                <ImageUploader
                    currentImages={[ `http://localhost:3005${form.profileImg}` ]}
                    multiple={false}
                    onFilesSelected={setSelectedFiles}
                />
                {/* 태그네임 */}
                <Box display="flex" gap={1} mb={2} alignItems="center">
                    <TextField
                        label="태그네임"
                        fullWidth
                        size="small"
                        value={form.TAGNAME || ''}
                        onChange={async (e) => {
                            const v = e.target.value.replace(/^@/, '');
                            setForm(prev => ({ ...prev, TAGNAME: v }));
                            setTagnameCheck({ valid: null, message: '' });
                            setTagnameLock(false);
                        }}
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 0.5, color: '#888' }}>@</Typography>,
                            readOnly: tagnameLock,
                        }}
                        error={tagnameCheck.valid === false}
                        helperText={tagnameCheck.message}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={async () => {
                            if (tagnameLock) {
                                setTagnameLock(false);
                                setTagnameCheck({ valid: null, message: '' });
                            } else {
                                const ok = await checkTagname();
                                if (ok) setTagnameLock(true);
                            }
                        }}
                    >
                        {tagnameLock ? '수정' : '변경'}
                    </Button>
                </Box>
                {/* 아이디/이름 */}
                <Box display="flex" gap={2} mb={2}>
                    <TextField label="아이디" fullWidth size="small" value={form.LOGIN_ID || ''} disabled />
                    <TextField label="이름" fullWidth size="small" value={form.USERNAME || ''} disabled />
                </Box>
                {/* 이메일 */}
                <Box display="flex" gap={1} mb={2}>
                    <TextField
                        label="이메일"
                        fullWidth
                        size="small"
                        value={form.EMAIL || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setForm(prev => ({ ...prev, EMAIL: val }));
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            setErrors(prev => ({ ...prev, email: emailRegex.test(val) ? '' : '올바른 이메일 형식이 아닙니다.' }));
                        }}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                    />
                    <Button
                        variant={form.EMAIL_VERIFIED === 'Y' ? 'contained' : 'outlined'}
                        size="small"
                        sx={{ minWidth: 80 }}
                    >
                        {form.EMAIL_VERIFIED === 'Y' ? '인증완료' : '인증'}
                    </Button>
                </Box>
                {/* 연락처 */}
                <Box display="flex" gap={1} mb={2}>
                    <TextField
                        label="연락처"
                        fullWidth
                        size="small"
                        value={form.PHONE || ''}
                        onChange={(e) => {
                            let v = e.target.value.replace(/[^\d]/g, '');
                            if (v.length > 3 && v.length <= 7) v = v.slice(0, 3) + '-' + v.slice(3);
                            else if (v.length > 7) v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11);
                            setForm(prev => ({ ...prev, PHONE: v }));
                            const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;
                            setErrors(prev => ({ ...prev, phone: phoneRegex.test(v) ? '' : '010-0000-0000 형식입니다.' }));
                        }}
                        error={Boolean(errors.phone)}
                        helperText={errors.phone}
                    />
                    <Button
                        variant={form.PHONE_VERIFIED === 'Y' ? 'contained' : 'outlined'}
                        size="small"
                        sx={{ minWidth: 80 }}
                    >
                        {form.PHONE_VERIFIED === 'Y' ? '인증완료' : '인증'}
                    </Button>
                </Box>
                {/* 생년월일/성별 */}
                <Box display="flex" gap={2} mb={2}>
                    <TextField
                        label="생년월일"
                        type="date"
                        fullWidth
                        size="small"
                        value={form.BIRTH || ''}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ max: new Date().toISOString().split('T')[0] }}
                        onChange={(e) => setForm(prev => ({ ...prev, BIRTH: e.target.value }))}
                    />
                    <TextField
                        label="성별"
                        select
                        fullWidth
                        size="small"
                        value={form.GENDER || ''}
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ native: true }}
                        onChange={(e) => setForm(prev => ({ ...prev, GENDER: e.target.value }))}
                    >
                        <option value="">선택</option>
                        <option value="M">남성</option>
                        <option value="F">여성</option>
                    </TextField>
                </Box>
                {/* 주소 */}
                <Box mb={2}>
                    <TextField
                        label="주소"
                        fullWidth
                        size="small"
                        value={form.ADDR || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, ADDR: e.target.value }))}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ pr: 4, pb: 3 }}>
                <Button variant="contained" color="primary" onClick={handleUpdate}>변경</Button>
                <Button onClick={onClose}>돌아가기</Button>
            </DialogActions>
        </Dialog>
    );
}