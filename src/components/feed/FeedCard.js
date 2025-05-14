import React, { useState } from 'react';
import {
    Card, CardHeader, CardContent, Avatar,
    Typography, Box, IconButton, Divider
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './swiper.css';
import { useNavigate } from 'react-router-dom';
import { formatDateOnly } from '../../utils/formatData';
import { useLikeFeed } from '../../hooks/useLikeFeed';

function renderHighlightedText(text, mentions = [], navigate) {
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
        let onClick = null;

        if (isMention && mentions[mentionIndex]) {
            const { id } = mentions[mentionIndex];
            const [type, realId] = id.split(':');
            if (type === 'USER') {
                href = `/myPage/${realId}`;
            } else if (type === 'DUSER') {
                href = `/deceased/${realId}`;
            }
            onClick = () => navigate(href);
            mentionIndex++;
        } else {
            const tagName = matched.slice(1);
            href = `/tag/${tagName}`;
            onClick = () => navigate(href);
        }

        parts.push(
            <span
                key={start}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
                style={{
                    color: isMention ? '#3f51b5' : '#009688',
                    fontWeight: 500,
                    cursor: 'pointer'
                }}
            >
                {matched}
            </span>
        );

        lastIndex = match.index + matched.length;
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

export default function FeedCard({ feed, onOpenDetail, commentCount, onLikeChange }) {
    const [showComments, setShowComments] = useState(false);
    const [commentCnt, setCommentCnt] = useState(commentCount);
    const { liked, likeCount, toggleLike } = useLikeFeed(feed.liked_by_me, feed.likeCount, feed.feedId)
    const navigate = useNavigate();

    const handleLikeClick = () => {
        toggleLike(); // 내부 상태 변경
        onLikeChange?.({
            liked_by_me: !liked,
            likeCount: liked ? likeCount - 1 : likeCount + 1
        });
    };

    return (
        <Card sx={{ mb: 3 }}>
            {/* 작성자 클릭 분리 */}
            <CardHeader
                avatar={
                    <Avatar
                        src={feed.user.profileImg}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/myPage/${feed.user.userId}`);
                        }}
                        sx={{ cursor: 'pointer' }}
                    >
                        {!feed.user.profileImg && feed.user.userName[0]}
                    </Avatar>
                }
                title={
                    <Typography
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/myPage/${feed.user.userId}`);
                        }}
                        sx={{ cursor: 'pointer' }}
                    >
                        {feed.user.userName}
                    </Typography>
                }
                subheader={
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/myPage/${feed.user.userId}`);
                        }}
                        sx={{ cursor: 'pointer' }}
                    >
                        {formatDateOnly(feed.createdAt)}
                    </Typography>
                }
            />

            {/* 이미지 Swiper 전체 클릭 → 모달 오픈 */}
            {feed.images?.length > 0 && (
                <Box
                    sx={{
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.02)' }
                    }}
                    onClick={() => {
                        onOpenDetail({
                            ...feed,
                            liked_by_me: liked,
                            likeCount: likeCount,
                            images: feed.images
                        });
                    }}
                >
                    <Swiper
                        spaceBetween={10}
                        slidesPerView={1}
                        navigation
                        modules={[Navigation]}
                        onSwiper={(swiper) => {
                            // 화살표 버튼 클릭 시 버블링 방지
                            setTimeout(() => {
                                const prevBtn = swiper.el.querySelector('.swiper-button-prev');
                                const nextBtn = swiper.el.querySelector('.swiper-button-next');

                                [prevBtn, nextBtn].forEach(btn => {
                                    btn?.addEventListener('click', (e) => {
                                        e.stopPropagation();
                                    });
                                });
                            }, 0);
                        }}
                    >
                        {feed.images.map((img) => (
                            <SwiperSlide key={img.imgNo}>
                                <img
                                    src={img.src}
                                    alt={`피드 이미지 ${img.imgNo}`}
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

            {/* 본문 */}
            <CardContent
                onClick={() => {
                    onOpenDetail({
                        ...feed,
                        liked_by_me: liked,
                        likeCount,
                        images: feed.images
                    });
                }}
                sx={{ pt: 1, cursor: 'pointer' }}
            >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {renderHighlightedText(feed.contents, feed.mentions, navigate)}
                </Typography>
            </CardContent>

            {/* 하단 좋아요/댓글 */}
            <Box display="flex" alignItems="center" px={2} pb={1}>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        handleLikeClick();
                    }}
                >
                    {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" mr={2}>{likeCount}</Typography>

                <IconButton onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail({
                        ...feed,
                        liked_by_me: liked,
                        likeCount,
                        images: feed.images
                    });
                }}>
                    <ChatBubbleOutlineIcon />
                </IconButton>
                <Typography variant="body2">
                    {commentCnt}
                </Typography>
            </Box>

            {/* 댓글 보기 toggle */}
            {showComments && (
                <Box px={2} pb={2}>
                    <Divider sx={{ mb: 1 }} />
                    {(feed.comments || []).map((comment) => (
                        <Box key={comment.COMMENTNO} mb={1}>
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
