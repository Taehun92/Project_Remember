import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Avatar,
    Grid,
    Paper,
    Button,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import EditProfileModal from '../components/profile/EditProfileModal';
import FollowerList from '../components/follow/FollowerList';
import { formatYearOnly } from '../utils/formatData';
import { useRecoilState } from 'recoil';
import { userProfileState } from '../state/userProfile';
import { cardSection } from '../components/common/styles';
import AddDeceasedModal from '../components/profile/AddDeceasedModal';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NewsFeedCard from '../components/feed/NewsFeedCard';

export default function MyPage() {
    const [info, setInfo] = useState(null);
    const [deceasedList, setDeceasedList] = useState([]);
    const [timelineList, setTimelineList] = useState([]);
    const [followedDeceased, setFollowedDeceased] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [newsFeedLogs, setNewsFeedLogs] = useState([]);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [feedModalOpen, setFeedModalOpen] = useState(false);

    const { userId: loginUserId } = jwtDecode(localStorage.getItem('token'));
    const { userId: routeParam } = useParams();
    const routeUserId = routeParam || loginUserId;
    const cancelled = false;

    const [profile, setProfile] = useRecoilState(userProfileState);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);

        (async () => {
            try {
                // 1) 유저 정보
                const resInfo = await fetch(`http://localhost:3005/user/info/${routeUserId}`);
                setInfo((await resInfo.json()).info);

                // 2) 관리하는 고인
                const resDec = await fetch(`http://localhost:3005/user/deceased/${routeUserId}`);
                setDeceasedList((await resDec.json()).list);

                // 3) 내가 팔로우한 고인
                const resFollow = await fetch(`http://localhost:3005/follow/${routeUserId}/following`);
                const { following = [] } = await resFollow.json();
                const mapped = following.map(d => ({
                    userId: d.duserId,
                    username: d.dusername,
                    tagname: d.tagname || '',
                    img_path: d.img_path,
                    img_name: d.img_name
                }));

                setFollowedDeceased(mapped);

                // 4) 타임라인
                const resTime = await fetch(`http://localhost:3005/user/timeline/${routeUserId}`);
                setTimelineList((await resTime.json()).list || []);

                // 5) 뉴스피드 로그
                const resNewsFeed = await fetch(`http://localhost:3005/newsfeed?userId=${routeUserId}`);
                const newsFeedData = await resNewsFeed.json();

                setNewsFeedLogs(Array.isArray(newsFeedData) ? newsFeedData : newsFeedData.data || newsFeedData.list || []);

            } catch (err) {
                console.error('데이터 로드 실패:', err);
            } finally {
                setLoading(false);  // 스피너 멈추는 용도
            }
        })();

        return () => { cancelled = true; };
    }, [routeUserId, loginUserId]);

    // 로그인 사용자 자신의 페이지일 때만 recoil 업데이트
    useEffect(() => {
        if (
            info !== null &&
            routeUserId === loginUserId &&
            info.img_path != null &&
            info.img_name != null
        ) {
            setProfile({
                img_path: info.img_path,
                img_name: info.img_name
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

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3005/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        return data.user;
    };

    // 프로필 이미지 URL
    const imgUrl = info.img_path && info.img_name ? `http://localhost:3005${info.img_path}${info.img_name}` : '/default-profile.png';

    // 타임라인 피드 클릭
    const handleFeedClick = async (feedId) => {
        try {
            const res = await fetch(`http://localhost:3005/feeds/${feedId}`);
            const data = await res.json();

            setSelectedFeed({
                feedId,
                contents: data.info.contents,
                mentions: [], // 필요 시 서버에서 내려받기
                tags: [], // 필요 시
                images: data.info.images || [],
                liked_by_me: data.info.liked_by_me,
                likeCount: data.info.likeCount,
                user: {
                    userId: data.info.userId,
                    userName: data.info.userName,
                    userTagName: data.info.tagName,
                    profileImg: `http://localhost:3005${data.info.img_path}${data.info.img_name}`
                }
            });
            setFeedModalOpen(true);
        } catch (err) {
            console.error('피드 상세 조회 실패:', err);
        }
    };

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
                        {Number(routeUserId) === Number(loginUserId) ? (
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                onClick={() => setEditOpen(true)}
                            >
                                정보 수정
                            </Button>
                        ) : (
                            <Tooltip title="DM 보내기">
                                <IconButton
                                    sx={{ position: 'absolute', top: 0, right: 0 }}
                                    color="primary"
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(
                                                `http://localhost:3005/dm/createOrGetRoom?user1=${loginUserId}&user2=${routeUserId}`
                                            );

                                            if (!res.ok) {
                                                const text = await res.text(); // HTML 응답일 수 있으니 문자열로 읽기
                                                console.error('⚠️ DM 방 생성 실패 응답:', text);
                                                throw new Error('DM 방 생성 실패: ' + res.status);
                                            }

                                            const room = await res.json(); // ✅ 이제 안전하게 파싱
                                            navigate(`/dm/${routeUserId}`);
                                        } catch (err) {
                                            console.error('DM 방 생성 실패:', err);
                                        }
                                    }}
                                >
                                    <ChatBubbleOutlineIcon sx={{ fontSize: 38 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Avatar src={imgUrl} sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }} />
                        <Typography variant="h5">{info.username}</Typography>
                        <Typography color="text.secondary">{info.tagname}</Typography>
                    </Box>

                    {/* 관리하는 고인 */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={1}>
                        <Typography variant="h6">기억을 남긴 인연</Typography>
                        {Number(routeUserId) === Number(loginUserId) && ( // ✅ 조건 추가
                            <Button variant="outlined" size="small" onClick={() => setAddOpen(true)}>
                                + 기억 추가
                            </Button>
                        )}
                    </Box>
                    <Grid container spacing={2}>
                        {deceasedList.map(d => (
                            <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={d.duserId}>
                                <Paper
                                    onClick={() => navigate(`/deceased/${d.duserId}`)}
                                    sx={{
                                        textAlign: 'center',
                                        p: 2,
                                        cursor: 'pointer',
                                        '&:hover': { boxShadow: 6 }
                                    }}
                                >
                                    <Avatar
                                        src={
                                            d.img_path && d.img_name
                                                ? `http://localhost:3005${d.img_path}${d.img_name}`
                                                : '/default-deceased.png'
                                        }
                                        sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                                    />
                                    <Typography>{d.dusername}</Typography>
                                    <Typography variant="caption">
                                        {formatYearOnly(d.dbirth)} ~ {formatYearOnly(d.death)}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* 팔로우한 고인 리스트 */}
                    <Box component={Paper} {...cardSection}>
                        <Typography variant="h6" gutterBottom>
                            기억을 나누는 인연
                        </Typography>
                        <FollowerList
                            followers={followedDeceased}
                            onUserClick={id => navigate(`/deceased/${id}`)}
                        />
                    </Box>

                    {/* 뉴스피드 로그 */}
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h6" gutterBottom>
                            최근 활동 소식
                        </Typography>

                        {newsFeedLogs.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                아직 활동 로그가 없습니다.
                            </Typography>
                        ) : (
                            newsFeedLogs.map((log) => (
                                <NewsFeedCard
                                    key={log.logId}
                                    log={log}
                                    onClick={() => {
                                        if (log.source) {
                                            const feedId = log.source.feedId || log.source.id; // COMMENT는 feedId, FEED는 id
                                            if (feedId) {
                                                navigate('/feeds', {
                                                    state: { scrollToFeedId: feedId }
                                                });
                                            }
                                        }
                                    }}
                                />
                            ))
                        )}
                    </Box>
                </Paper>
            </Box>

            {/* 정보 수정 모달 */}
            <EditProfileModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                userData={info}
                fetchUser={fetchUser}
                setUser={(updatedUser) => {
                    setProfile({
                        img_path: updatedUser.img_path,
                        img_name: updatedUser.img_name
                    });
                    setInfo(updatedUser); // 화면 갱신을 위해 info도 갱신 ✅
                }}
                onUpdated={(updatedUser) => {
                    setInfo(updatedUser); // 이걸 반드시 해줘야 반영됨 ✅
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
