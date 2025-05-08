import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Paper, Button } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../components/profile/EditProfileModal';
import { formatYearOnly } from '../utils/formatData';


function MyPage() {
    let [info, setInfo] = useState({ userName: "", email: "", intro: "", profileImg: "" });
    let [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    let [deceasedList, setDeceasedList] = useState([]);
    const [timelineList, setTimelineList] = useState([]);

    const imgUrl = info.IMG_PATH && info.IMG_NAME
        ? `http://localhost:3005${info.IMG_PATH}${info.IMG_NAME}`
        : '/default-profile.png';

    let token = localStorage.getItem('token');
    const navigate = useNavigate();

    const fnFetchData = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.userId;

        try {
            // 사용자 정보 + 프로필 이미지
            const userRes = await fetch(`http://localhost:3005/user/info/${userId}`);
            const userData = await userRes.json();
            setInfo(userData.info);
            console.log(userData.info);

            // 고인 정보 + 이미지
            const deceasedRes = await fetch(`http://localhost:3005/user/deceased/${userId}`);
            const deceasedData = await deceasedRes.json();
            console.log("🧾 deceasedData:", deceasedData);
            setDeceasedList(deceasedData.list); // 배열 형태로 온다고 가정
            console.log(deceasedList);

            // 타임 라인
            const fetchTimeline = await fetch(`http://localhost:3005/user/timeline/${userId}`);
            const data = await fetchTimeline.json();
            setTimelineList(data.list); // 리스트만 받는다고 가정

        } catch (err) {
            console.error("데이터 조회 실패:", err);
        }
    };

    const handleEditClose = () => {
        setEditOpen(false);
        fnFetchData(); // 정보 재조회로 최신화
    };

    console.log('🐞 info:', info);
    console.log('🐞 imgUrl:', imgUrl);
    useEffect(() => {
        fnFetchData();
    }, []);
    

    return (
        <Container maxWidth="md">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="flex-start"
                minHeight="100vh"
                sx={{ padding: '20px' }}
            >
                <Paper elevation={3} sx={{ padding: '20px', borderRadius: '15px', width: '100%' }}>
                    {/* 프로필 정보 상단 배치 */}
                    <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 3, position: 'relative' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ position: 'absolute', top: 0, right: 0 }}
                            onClick={() => setEditOpen(true)}
                        >
                            정보 수정
                        </Button>
                        <Avatar
                            alt="프로필 이미지"
                            src={imgUrl}
                            sx={{ width: 100, height: 100, marginBottom: 2 }}
                            onClick={() => { setOpen(!open) }}
                        />
                        <Typography variant="h5">{info.USERNAME}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {info.TAGNAME}
                        </Typography>
                    </Box>
                    {/* 고인 목록 */}
                    <Typography variant="h6" gutterBottom>내가 관리하는 고인</Typography>
                    <Grid container spacing={2}>
                        {deceasedList.map((duser) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={duser.DUSERID}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: '0.2s',
                                        '&:hover': { boxShadow: 6 },
                                    }}
                                    onClick={() => navigate(`/deceased/${duser.DUSERID}`)}
                                >
                                    <Avatar
                                        src={`http://localhost:3005/${duser.img_path || 'default-deceased.png'}`}
                                        sx={{ width: 80, height: 80, mx: 'auto' }}
                                    />
                                    <Typography variant="subtitle1">{duser.DUSERNAME}</Typography>
                                    <Typography variant="body2">{duser.RELATION}</Typography>
                                    <Typography variant="caption">
                                        {formatYearOnly(duser.DBIRTH)} ~ {formatYearOnly(duser.DEATH)}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h6" gutterBottom>전체 타임라인</Typography>
                        {timelineList.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                타임라인이 아직 없습니다.
                            </Typography>
                        ) : (
                            <Box>
                                {timelineList.map((item) => (
                                    <Paper key={item.TIMELINENO} sx={{ p: 2, mb: 2 }}>
                                        <Typography variant="subtitle2" color="primary">
                                            {item.dusername} 님
                                        </Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{item.content}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(item.created_at).toLocaleString()}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>
            <EditProfileModal
                open={editOpen}
                onClose={handleEditClose}
                userData={info}
            />
        </Container>
    );
}

export default MyPage;