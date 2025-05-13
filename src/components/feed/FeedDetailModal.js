// src/components/feed/FeedDetailModal.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  ImageList,
  ImageListItem,
  Divider,
  Button,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { jwtDecode } from 'jwt-decode';
import { MentionsInput, Mention } from 'react-mentions';
import { useNavigate } from 'react-router-dom';
import { parseMentionsAndTags } from '../../utils/parseMentionsAndTags';

export default function FeedDetailModal({ open, onClose, feedInfo, imgList }) {
  const [feedDetail, setFeedDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [mentions, setMentions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!feedInfo) return;
    setFeedDetail(feedInfo);
    setLikeCount(feedInfo.likeCount || 0);
    setLiked(feedInfo.liked_by_me || false);
  }, [feedInfo]);

  useEffect(() => {
    if (!feedInfo?.feedId) return;
    fetch(`http://localhost:3005/comments/${feedInfo.feedId}`)
      .then(res => res.json())
      .then(data => setComments(data.list || []))
      .catch(err => console.error('댓글 목록 불러오기 실패:', err));
    console.log("comments", comments);

  }, [feedInfo]);

  const handleLike = () => {
    setLiked(prev => !prev);
    setLikeCount(prev => (liked ? prev - 1 : prev + 1));
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      const mentionUserIds = mentions
        .filter(m => m.id.startsWith('USER:') || m.id.startsWith('DUSER:'))
        .map(m => parseInt(m.id.split(':')[1], 10));

      const res = await fetch(`http://localhost:3005/comments/${feedInfo.feedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contents: newComment,
          parentCommentNo: null,
          mentions: mentionUserIds
        })
      });

      const data = await res.json();
      if (data.success) {
        const commentRes = await fetch(`http://localhost:3005/comments/${feedInfo.feedId}`);
        const commentData = await commentRes.json();
        setComments(commentData.list || []);
        setNewComment('');
        setMentions([]);
      } else {
        alert('댓글 등록 실패');
      }
    } catch (err) {
      console.error('댓글 등록 중 오류:', err);
      alert('댓글 등록 실패');
    }
  };

  return (
    <>
      <style>{`
        .mentions__suggestions {
          position: absolute !important;
          top: 100%;
          left: 0;
          z-index: 9999;
          background: white;
          border: 1px solid #ccc;
          border-radius: 6px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          max-height: 200px;
          overflow-y: auto;
          width: 100%;
        }

        .mention-link, .tag-link {
          cursor: pointer;
        }

        .mention-link:hover, .tag-link:hover {
          text-decoration: underline;
        }

        .mentions__control {
          position: relative;
          min-height: 80px;
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 8px;
          font-size: 14px;
          line-height: 1.5;
          background-color: #fff;
        }

        .mentions__input {
          min-height: 80px;
          outline: none;
          overflow-y: auto;
          white-space: pre-wrap;
        }

        .mentions__highlighter {
          min-height: 80px;
          white-space: pre-wrap;
        }
      `}</style>

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ m: 0, p: 2 }}>
          피드 상세보기
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', minHeight: 800, overflow: 'invisible' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {feedDetail?.contents}
            </Typography>
            {imgList && imgList.length > 0 && (
              <ImageList cols={2} gap={10}>
                {imgList.map((item, idx) => (
                  <ImageListItem key={idx}>
                    <img
                      src={item.src}
                      alt={item.imgName}
                      loading="lazy"
                      style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 4 }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>



          <Box
            sx={{
              width: 320,
              borderLeft: '1px solid #eee',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative', // ✅ 기준점
              backgroundColor: '#fff'
            }}
          >
            {/* 좋아요 + 댓글 수 표시 */}
            <Box sx={{ px: 2, pt: 1, pb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <IconButton onClick={handleLike}>
                    {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography variant="body2">{likeCount}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <ChatBubbleOutlineIcon sx={{ mr: 0.5 }} />
                  <Typography variant="body2">{comments.length}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mt: 1 }} />
            </Box>

            {/* 댓글 리스트 (스크롤) */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 2,
                maxHeight: 'calc(100vh - 230px)', // 모달 타이틀 + 입력창 + 버튼 높이 뺀 값
                pb: 2,
                position: 'relative',
                overflowX: 'visible',
                overflowY: 'auto'
              }}
            >
              {comments.map((comment, index) => (
                <Box
                  key={comment.commentNo}
                  mb={index === comments.length - 1 ? 22 : 2}  // ✅ 마지막 댓글만 넉넉하게 margin
                  display="flex"
                  gap={1}
                >
                  <Avatar src={comment.user.img} sx={{ width: 28, height: 28 }} />
                  <Box>
                    <Typography fontWeight="bold" variant="body2">
                      {comment.user.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      dangerouslySetInnerHTML={{
                        __html: parseMentionsAndTags(comment.contents, comment.mentions || [], navigate)
                      }}
                      onClick={(e) => {
                        const target = e.target.closest('.mention-link, .tag-link');
                        if (target) {
                          const type = target.dataset.type;
                          const id = target.dataset.id;
                          const tag = target.dataset.tag;
                          if (type === 'USER') navigate(`/myPage/${id}`);
                          else if (type === 'DUSER') navigate(`/deceased/${id}`);
                          else if (tag) navigate(`/feeds?tag=${tag}`);
                        }
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* 입력창 + 등록 버튼 (하단 고정) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: '#fff',
                px: 2,
                pt: 2,
                pb: 2,
                borderTop: '1px solid #eee',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              {/* 입력창 */}
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  padding: 1,
                  backgroundColor: '#fff',
                  // 🔥 overflow 제거 (또는 overflow: visible)
                  overflow: 'visible'
                }}
              >
                <MentionsInput
                  value={newComment}
                  markup="@{{__display__}}({{__id__}})"
                  onChange={(e, newVal, plainTextValue, mentionList) => {
                    setNewComment(newVal);
                    setMentions(mentionList);
                  }}
                  classNames={{
                    control: 'mentions__control',
                    input: 'mentions__input',
                    highlighter: 'mentions__highlighter',
                    suggestions: 'mentions__suggestions'
                  }}
                  style={{
                    control: {
                      backgroundColor: '#fff',
                      border: 'none',
                      fontSize: 14,
                      width: '100%',
                      minHeight: 60,
                      padding: 0
                    },
                    highlighter: {
                      padding: 0,
                      minHeight: 60
                    },
                    input: {
                      padding: 0,
                      minHeight: 60,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Mention
                    trigger="@"
                    data={async (search, callback) => {
                      const res = await fetch(`http://localhost:3005/user/search?tagname=${search}`);
                      const data = await res.json();
                      const results = (data.list || []).map(user => {
                        const isUser = user.IMG_PATH?.includes('/profile/');
                        const id = `${isUser ? 'USER' : 'DUSER'}:${user.ID}`;
                        return {
                          id,
                          display: user.TAGNAME,
                          username: user.USERNAME,
                          filepath: user.IMG_PATH || '',
                          filename: user.IMG_NAME || ''
                        };
                      });
                      callback(results);
                    }}
                    displayTransform={(id, display) => `${display}`}
                    markup="@{{__display__}}({{__id__}})"
                    appendSpaceOnAdd
                    renderSuggestion={(entry, search, highlightedDisplay, index, focused) => (
                      <div
                        key={entry.id + '-' + index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: focused ? '#f0f0f0' : '#fff',
                          padding: '6px 10px',
                          borderBottom: '1px solid #eee',
                          gap: '10px'
                        }}
                      >
                        <img
                          src={
                            entry.filepath && entry.filename
                              ? `http://localhost:3005${entry.filepath}${entry.filename}`
                              : '/default-profile.png'
                          }
                          alt="프로필"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{ lineHeight: 1.2 }}>
                          <div style={{ fontWeight: 'bold' }}>{entry.display}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{entry.username}</div>
                        </div>
                      </div>
                    )}
                  />
                </MentionsInput>
              </Box>

              {/* 버튼 */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddComment}
                fullWidth
              >
                등록
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
