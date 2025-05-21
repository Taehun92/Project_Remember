import {
    Card,
    CardHeader,
    Avatar,
    Typography,
    CardContent,
    CardMedia,
    Box
} from '@mui/material';
import { renderHighlightedText } from '../../utils/renderHighlightedText';
import { useNavigate } from 'react-router-dom';


function NewsFeedCard({ log, onClick }) {
    const { actor, summary, createdAt, source } = log;
    const navigate = useNavigate();

    const formatTime = (iso) => {
        const date = new Date(iso);
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSourceLabel = () => {
        if (!log?.type || !log?.sourceType) return '';

        // 멘션 또는 좋아요일 때만 표시
        if (log.type === 'MENTION' || log.type === 'LIKE') {
            if (log.sourceType === 'FEED') return '회원님의 게시글에서';
            if (log.sourceType === 'COMMENT') return '회원님의 댓글에서';
        }

        return ''; // COMMENT일 경우 빈 문자열 반환
    };

    return (
        <Card
            sx={{ mb: 3, borderRadius: 2, boxShadow: 1, cursor: source ? 'pointer' : 'default' }}
            onClick={() => onClick?.()}
        >
            {/* 프로필 정보 */}
            <CardHeader
                avatar={
                    <Avatar src={actor.profileImg} alt={actor.tagName} sx={{ width: 48, height: 48 }} />
                }
                title={
                    <Typography variant="subtitle2" color="text.primary">
                        {actor.tagName}
                    </Typography>
                }
                subheader={
                    <Typography variant="caption" color="text.secondary">
                        {formatTime(createdAt)}
                    </Typography>
                }
            />

            {/* summary */}
            <CardContent sx={{ pt: 0 }}>
                <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                    {actor.userName}님이 {getSourceLabel()} {summary}
                </Typography>

                {/* 콘텐츠 (피드/댓글) */}
                {source?.content && (
                    <Box
                        sx={{
                            backgroundColor: '#f9f9f9',
                            border: '1px solid #eee',
                            borderRadius: 1,
                            p: 2,
                            fontSize: 14,
                            color: '#333',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        <Typography variant="body2" component="div">
                            {renderHighlightedText(source.content, source.mentions || [], navigate)}
                        </Typography>

                        {source.images?.length > 0 && (
                            <CardMedia
                                component="img"
                                src={source.images[0]}
                                alt="source-thumbnail"
                                sx={{
                                    mt: 2,
                                    borderRadius: 1,
                                    maxHeight: 240,
                                    objectFit: 'cover'
                                }}
                            />
                        )}
                    </Box>
                )}
            </CardContent>
        </Card >
    );
}

export default NewsFeedCard;
