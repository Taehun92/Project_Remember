// src/pages/MyPage.jsx
import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Avatar,
    Grid,
    Paper,
    Button,
    CircularProgress
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import EditProfileModal from '../components/profile/EditProfileModal';
import FollowerList from '../components/follow/FollowerList';
import { formatYearOnly } from '../utils/formatData';
import { useRecoilState } from 'recoil';
import { userProfileState } from '../state/userProfile';
import { cardSection } from '../components/common/styles';
import UserTimeline from '../components/timeline/UserTimeline';
import AddDeceasedModal from '../components/profile/AddDeceasedModal';

export default function MyPage() {
    const [info, setInfo] = useState(null);
    const [deceasedList, setDeceasedList] = useState([]);
    const [timelineList, setTimelineList] = useState([]);
    const [followedDeceased, setFollowedDeceased] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);

    const { userId: loginUserId } = jwtDecode(localStorage.getItem('token'));
    const { userId: routeParam } = useParams();
    const routeUserId = routeParam || loginUserId;

    const [profile, setProfile] = useRecoilState(userProfileState);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                // 1) 유저 정보
                const resInfo = await fetch(`http://localhost:3005/user/info/${routeUserId}`);
                console.log('/user/info ▶', resInfo.ok, await resInfo.clone().json());
                setInfo((await resInfo.json()).info);

                // 2) 관리하는 고인
                const resDec = await fetch(`http://localhost:3005/user/deceased/${routeUserId}`);
                console.log('/user/deceased ▶', resDec.ok, await resDec.clone().json());
                setDeceasedList((await resDec.json()).list);

                // 3) 내가 팔로우한 고인
                const resFollow = await fetch(`http://localhost:3005/follow/${routeUserId}/following`);
                console.log('/follow/.../following ▶', resFollow.ok, await resFollow.clone().json());
                const { following = [] } = await resFollow.json();
                const mapped = following.map(d => ({
                    USERID: d.DUSERID,
                    USERNAME: d.DUSERNAME,
                    TAGNAME: d.TAGNAME || '',
                    IMG_PATH: d.IMG_PATH,
                    IMG_NAME: d.IMG_NAME
                }));

                setFollowedDeceased(mapped);

                // 4) 타임라인
                const resTime = await fetch(`http://localhost:3005/user/timeline/${routeUserId}`);
                console.log('/user/timeline ▶', resTime.ok, await resTime.clone().json());
                setTimelineList((await resTime.json()).list || []);

            } catch (err) {
                console.error('데이터 로드 실패:', err);
            } finally {
                setLoading(false);  // 이 줄이 꼭 실행되어야 스피너가 멈춥니다.
            }
        })();

        return () => { cancelled = true; };
    }, [routeUserId, loginUserId]);

    // 로그인 사용자 자신의 페이지일 때만 recoil 업데이트
    useEffect(() => {
        if (
            info !== null &&
            routeUserId === loginUserId &&
            info.IMG_PATH != null &&
            info.IMG_NAME != null
        ) {
            setProfile({
                IMG_PATH: info.IMG_PATH,
                IMG_NAME: info.IMG_NAME
            });
        }
    }, [info, routeUserId, loginUserId, setProfile]);

    // 로딩 또는 info가 빈 상태라면 스피너
    if (loading || info === null) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    // 프로필 이미지 URL
    const imgUrl =
        info.IMG_PATH && info.IMG_NAME
            ? `http://localhost:3005${info.IMG_PATH}${info.IMG_NAME}`
            : '/default-profile.png';

    return (
        <Container maxWidth="md">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="flex-start"
                minHeight="100vh"
                sx={{ p: 2 }}
            >
                <Paper sx={{ width: '100%', p: 3, borderRadius: 2 }} elevation={3}>
                    {/* 프로필 상단 */}
                    <Box sx={{ textAlign: 'center', position: 'relative', mb: 3 }}>
                        {Number(routeUserId) === Number(loginUserId) && (
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                onClick={() => setEditOpen(true)}
                            >
                                정보 수정
                            </Button>
                        )}
                        <Avatar src={imgUrl} sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }} />
                        <Typography variant="h5">{info.USERNAME}</Typography>
                        <Typography color="text.secondary">{info.TAGNAME}</Typography>
                    </Box>

                    {/* 관리하는 고인 */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={1}>
                        <Typography variant="h6">내가 관리하는 고인</Typography>
                        <Button variant="outlined" size="small" onClick={() => setAddOpen(true)}>
                            + 고인 추가
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        {deceasedList.map(d => (
                            <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={d.DUSERID}>
                                <Paper
                                    onClick={() => navigate(`/deceased/${d.DUSERID}`)}
                                    sx={{
                                        textAlign: 'center',
                                        p: 2,
                                        cursor: 'pointer',
                                        '&:hover': { boxShadow: 6 }
                                    }}
                                >
                                    <Avatar
                                        src={
                                            d.IMG_PATH && d.IMG_NAME
                                                ? `http://localhost:3005${d.IMG_PATH}${d.IMG_NAME}`
                                                : '/default-deceased.png'
                                        }
                                        sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                                    />
                                    <Typography>{d.DUSERNAME}</Typography>
                                    <Typography variant="caption">
                                        {formatYearOnly(d.DBIRTH)} ~ {formatYearOnly(d.DEATH)}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* 팔로우한 고인 리스트 */}
                    <Box component={Paper} {...cardSection}>
                        <Typography variant="h6" gutterBottom>
                            내가 팔로우한 고인
                        </Typography>
                        <FollowerList
                            followers={followedDeceased}
                            onUserClick={id => navigate(`/deceased/${id}`)}
                        />
                    </Box>

                    {/* 타임라인 */}
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h6" gutterBottom>
                            전체 타임라인
                        </Typography>
                        <UserTimeline timelineList={timelineList} />
                    </Box>
                </Paper>
            </Box>

            {/* 정보 수정 모달 */}
            <EditProfileModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                userData={info}
                onUpdated={() => {
                    setEditOpen(false);
                }}
            />

            {/* 고인 추가 모달 */}
            <AddDeceasedModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onSaved={newDec => {
                    setDeceasedList(prev => [...prev, newDec]);
                    setAddOpen(false);
                }}
            />
        </Container>
    );
}
