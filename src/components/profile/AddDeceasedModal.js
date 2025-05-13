import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, MenuItem, Typography
} from '@mui/material';

const genderOptions = ['M', 'F'];

export default function AddDeceasedModal({ open, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: '',
        birth: '',
        death: '',
        gender: '',
        relation: '',
        restPlace: '',
        contents: ''
    });
    const [files, setFiles] = useState([]);

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        if (selected.length + files.length > 10) {
            alert('첨부파일은 최대 10개까지 업로드할 수 있습니다.');
            return;
        }
        setFiles(prev => [...prev, ...selected]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        const { name, birth, death, gender, relation, restPlace, contents } = form;
        if (!name || !birth || !death || !gender || !relation) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('birth', birth);
        formData.append('death', death);
        formData.append('gender', gender);
        formData.append('relation', relation);
        formData.append('restPlace', restPlace);
        formData.append('contents', contents);
        files.forEach(file => formData.append('files', file));

        try {
            const res = await fetch('http://localhost:3005/user/deceased/create', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.success) {
                onSaved(data.deceased);
            } else {
                alert('등록에 실패했습니다.');
            }
        } catch (err) {
            console.error('고인 등록 실패:', err);
            alert('서버 오류가 발생했습니다.');
        }
    };

    const handleClose = () => {
        setForm({
            name: '',
            birth: '',
            death: '',
            gender: '',
            relation: '',
            restPlace: '',
            contents: ''
        });
        setFiles([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>고인 추가</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <Typography variant="caption" color="error">
                        * 는 필수 입력 항목입니다.
                    </Typography>
                    <TextField
                        label="이름 *"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="출생일 (YYYY-MM-DD) *"
                        value={form.birth}
                        onChange={e => handleChange('birth', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="사망일 (YYYY-MM-DD) *"
                        value={form.death}
                        onChange={e => handleChange('death', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        select
                        label="성별 *"
                        value={form.gender}
                        onChange={e => handleChange('gender', e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="M">남성</MenuItem>
                        <MenuItem value="F">여성</MenuItem>
                    </TextField>
                    <TextField
                        label="관계"
                        value={form.relation}
                        onChange={e => handleChange('relation', e.target.value)}
                        fullWidth
                    />
                    <Typography variant="caption" color="text.secondary">
                        ※ 가족관계증명서로 가족이 확인되어야 등록이 가능합니다.
                    </Typography>
                    <TextField label="안치 장소" value={form.restPlace} onChange={e => handleChange('restPlace', e.target.value)} fullWidth />
                    <TextField
                        label="소개 문구"
                        multiline rows={3}
                        value={form.contents}
                        onChange={e => handleChange('contents', e.target.value)}
                        fullWidth
                    />

                    <div>
                        <Typography variant="subtitle2" gutterBottom>
                            첨부파일 (최대 10개) <br />
                            <Typography variant="caption" color="text.secondary">
                                ※ 사망진단서, 가족관계증명서 등 관련 서류를 첨부해주세요.
                            </Typography>
                        </Typography>
                        <input type="file" multiple accept="image/*,.pdf,.docx" onChange={handleFileChange} />
                        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                            {files.map((f, i) => (
                                <li key={i}>
                                    {f.name}
                                    <Button size="small" onClick={() => removeFile(i)}>삭제</Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>취소</Button>
                <Button variant="contained" onClick={handleSave}>저장</Button>
            </DialogActions>
        </Dialog>
    );
}
