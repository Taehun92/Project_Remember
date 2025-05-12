import React, { useState } from 'react';
import {
    Card, CardHeader, CardContent, Avatar,
    Typography, Box, IconButton, Divider
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './swiper.css';

function renderHighlightedText(text, mentions = []) {
    const regex = /(@[\w가-힣]+)|(#\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let mentionIndex = 0;

    while ((match = regex.exec(text)) !== null) {
        const [matched] = match;
        const start = match.index;

        if (lastIndex < start) parts.push(text.slice(lastIndex, start));

        const isMention = matched.startsWith('@');
        let href = '#';

        if (isMention && mentions[mentionIndex]) {
            const { id } = mentions[mentionIndex];
            const [type, realId] = id.split(':');
            if (type === 'USER') {
                href = `/myPage/${encodeURIComponent(realId)}`;
            } else if (type === 'DUSER') {
                href = `/deceased/${encodeURIComponent(realId)}`;
            }
            mentionIndex++;
        } else if (!isMention) {
            const tagName = matched.slice(1);
            href = `/tag/${encodeURIComponent(tagName)}`;
        }

        parts.push(
            <a
                key={start}
                href={href}
                style={{
                    color: isMention ? '#3f51b5' : '#009688',
                    fontWeight: 500,
                    textDecoration: 'none'
                }}
            >
                {matched}
            </a>
        );

        lastIndex = match.index + matched.length;
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

export default function FeedCard({ feed }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(feed.likeCount || 0);
    const [showComments, setShowComments] = useState(false);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => (liked ? prev - 1 : prev + 1));
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader
                avatar={
                    <Avatar src={feed.user.profileImg}>
                        {!feed.user.profileImg && feed.user.userName[0]}
                    </Avatar>
                }
                title={feed.user.userName}
                subheader={new Date(feed.createdAt).toISOString().slice(0, 10)}
            />

            {/* ✅ Swiper: 이미지 수평 스크롤 */}
            {feed.images?.length > 0 && (
                <Box>
                    <Swiper
                        spaceBetween={10}
                        slidesPerView={1}
                        navigation // ✅ 이 줄만 추가하면 화살표 생김
                        modules={[Navigation]} // ✅ 등록된 모듈 명시
                    >
                        {feed.images.map((img, idx) => (
                            <SwiperSlide key={idx}>
                                <img
                                    src={img.src}
                                    alt={`피드 이미지 ${idx + 1}`}
                                    style={{
                                        width: '100%',
                                        maxHeight: 400,
                                        objectFit: 'cover',
                                        borderRadius: 8
                                    }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            )}

            <CardContent sx={{ pt: 1 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {renderHighlightedText(feed.contents, feed.mentions)}
                </Typography>
            </CardContent>

            {/* ❤️ 좋아요 & 💬 댓글 아이콘 */}
            <Box display="flex" alignItems="center" px={2} pb={1}>
                <IconButton onClick={handleLike}>
                    {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" mr={2}>
                    {likeCount}
                </Typography>

                <IconButton onClick={() => setShowComments(prev => !prev)}>
                    <ChatBubbleOutlineIcon />
                </IconButton>
                <Typography variant="body2">{feed.comments?.length || 0}</Typography>
            </Box>

            {/* 댓글 보기 */}
            {showComments && (
                <Box px={2} pb={2}>
                    <Divider sx={{ mb: 1 }} />
                    {(feed.comments || []).map((comment, idx) => (
                        <Box key={idx} mb={1}>
                            <Typography variant="body2">
                                <strong>{comment.userName}</strong>: {comment.content}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Card>
    );
}
