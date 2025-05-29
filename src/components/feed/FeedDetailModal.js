// src/components/feed/FeedDetailModal.jsx
import React, { useEffect, useState, useCallback } from 'react';
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
import { renderHighlightedText } from '../../utils/renderHighlightedText';
import { parseMentionMarkup } from '../../utils/parseMentionMarkup';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FeedModal from './FeedModal';
import { useLikeFeed } from '../../hooks/useLikeFeed';

export default function FeedDetailModal({ open, onClose, feedInfo, imgList, onDeleteFeed }) {
  const [feedDetail, setFeedDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [mentions, setMentions] = useState([]);
  const [replyTarget, setReplyTarget] = useState(null); // 답글 입력창 노출 대상 commentNo
  const [replyText, setReplyText] = useState('');
  const [replyMentions, setReplyMentions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTargetComment, setEditTargetComment] = useState(null); // 수정 대상 댓글
  const [editText, setEditText] = useState('');
  const [editMentions, setEditMentions] = useState([]);
  const { liked, likeCount, toggleLike } = useLikeFeed(feedInfo?.liked_by_me, feedInfo?.likeCount, feedInfo?.feedId);
  const menuOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.userId;


  useEffect(() => {
    setFeedDetail(feedInfo);
  }, [feedInfo?.feedId, feedInfo?.likeCount, feedInfo?.liked_by_me]);

  useEffect(() => {
    if (feedInfo?.feedId) {
      fetchComments();
    }
  }, [feedInfo?.feedId]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setAnchorEl(null);
    setEditModalOpen(true);
  };

  const handleDelete = async () => {
    setAnchorEl(null);
    if (!window.confirm('정말 이 피드를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`http://localhost:3005/feeds/${feedInfo.feedId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        alert('삭제되었습니다.');
        onClose(); // 모달 닫기
        onDeleteFeed?.(feedInfo.feedId);
      } else {
        alert('삭제 실패');
      }
    } catch (err) {
      console.error('삭제 오류:', err);
      alert('서버 오류로 삭제 실패');
    }
  };

  // 댓글 등록
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      const mentionUserIds = mentions.map(m => m.id);

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
        await fetchComments();  // ✅ 여기!
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

  // 대댓글 등록
  const handleAddReply = async (parentCommentNo) => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      const mentionUserIds = replyMentions.map(m => m.id);

      const res = await fetch(`http://localhost:3005/comments/${feedInfo.feedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          contents: replyText,
          parentCommentNo,
          mentions: mentionUserIds
        })
      });

      const data = await res.json();
      if (data.success) {
        await fetchComments();  // ✅ 여기!
        setReplyTarget(null);
        setReplyText('');
        setReplyMentions([]);
      } else {
        alert('답글 등록 실패');
      }
    } catch (err) {
      console.error('답글 등록 중 오류:', err);
      alert('답글 등록 실패');
    }
  };

  // 멘션 클릭 시 페이지 이동
  const handleMentionClick = (e) => {
    const target = e.target.closest('.mention-link, .tag-link');
    if (!target) return;

    const type = target.dataset.type;
    const id = target.dataset.id;
    const tag = target.dataset.tag;

    if (type === 'USER') navigate(`/myPage/${id}`);
    else if (type === 'DUSER') navigate(`/deceased/${id}`);
    else if (tag) navigate(`/feeds?tag=${tag}`);
  };

  // 댓글 수정 모달
  const handleEditComment = (comment) => {
    setEditTargetComment(comment);

    const { plainText, mentions } = parseMentionMarkup(comment.contents);
    setEditText(plainText);       // 👉 MentionsInput용 plainText
    setEditMentions(mentions);    // 👉 MentionsInput용 mentions [{id, display}]
  };

  // 댓글 수정
  const handleSubmitEdit = async (commentNo) => {
    try {
      const res = await fetch(`http://localhost:3005/comments/${commentNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          feedNo: feedDetail.feedId,
          contents: editText,
          mentions: editMentions.map(m => m.id)
        })
      });

      const data = await res.json();
      if (data.success) {
        setEditTargetComment(null);
        alert('댓글이 수정되었습니다.');
        await fetchComments(); // 댓글 새로고침
      } else {
        alert('댓글 수정 실패');
      }
    } catch (err) {
      console.error('댓글 수정 오류:', err);
      alert('오류가 발생했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentNo) => {
    if (!window.confirm('이 댓글을 삭제할까요?')) return;
    try {
      const res = await fetch(`http://localhost:3005/comments/${commentNo}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (data.success) {
        await fetchComments(); // 댓글 새로고침
      } else {
        alert('댓글 삭제 실패');
      }
    } catch (err) {
      console.error('댓글 삭제 오류:', err);
      alert('삭제 중 오류 발생');
    }
  };

  // 댓글 불러오기
  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:3005/comments/${feedInfo.feedId}`);
      const data = await res.json();
      setComments(data.list || []);
      setCommentCount(data.totalCount || 0);
    } catch (err) {
      console.error('댓글 목록 불러오기 실패:', err);
    }
  };

  // 멘션 불러오기
  const fetchMentionData = useCallback((query, callback) => {
    const cleaned = query.replace(/^@/, '').toLowerCase();
    fetch(`http://localhost:3005/user/search?all=true`) // 전체 목록 받아오고
      .then(res => res.json())
      .then(data => {
        const filtered = (data.list || []).filter(user =>
          user.tagName.toLowerCase().includes(cleaned)
        ).map(user => {
          const isUser = user.img_path?.includes('/profile/');
          return {
            id: `${isUser ? 'USER' : 'DUSER'}:${user.ID}`,
            display: user.tagName,
            userName: user.userName,
            filepath: user.img_path || '',
            filename: user.img_name || ''
          };
        });
        callback(filtered);
      });
  }, []);

  function formatDateTime(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hour = ('0' + date.getHours()).slice(-2);
    const minute = ('0' + date.getMinutes()).slice(-2);

    return `${year}.${month}.${day} ${hour}:${minute}`;
  }

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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* 👤 작성자 정보 영역 */}
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                src={
                  feedDetail?.user?.profileImg ||
                  '/default-profile.png'
                }
                sx={{ width: 60, height: 60 }}
              />
              <Box>
                <Typography fontWeight="bold" variant="body2">
                  {feedDetail?.user?.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {feedDetail?.user?.userTagName}
                </Typography>
              </Box>
            </Box>

            {/* ⋮ 수정/삭제 버튼 */}
            <Box>
              {Number(feedDetail?.user?.userId) === Number(jwtDecode(localStorage.getItem('token'))?.userId) && (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    <MoreVertIcon />
                  </IconButton>

                  <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEdit}>수정</MenuItem>
                    <MenuItem onClick={handleDelete}>삭제</MenuItem>
                  </Menu>
                </>
              )}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            display: 'flex',
            height: 'calc(100vh - 150px)',
            overflow: 'hidden'
          }}
        >
          {/* 왼쪽 피드 본문 영역 */}
          <Box
            sx={{
              flex: 1,
              pr: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography
              variant="body1"
              sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
              onClick={handleMentionClick}
            >
              {renderHighlightedText(feedDetail?.contents || '', feedDetail?.mentions || [], navigate)}
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

          {/* 오른쪽 댓글 + 입력 영역 */}
          <Box
            sx={{
              width: 360,
              borderLeft: '1px solid #eee',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              backgroundColor: '#fff'
            }}
          >
            {/* 좋아요/댓글 수 영역 */}
            <Box sx={{ px: 2, pt: 1, pb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <IconButton onClick={toggleLike}>
                    {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography variant="body2">{likeCount}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <ChatBubbleOutlineIcon sx={{ mr: 0.5 }} />
                  <Typography variant="body2">{commentCount}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mt: 1 }} />
            </Box>

            {/* 댓글 리스트 영역 (유동적으로 확장됨) */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 2,
                pb: 2
              }}
            >
              {comments.map((comment) => (
                <Box key={comment.commentNo} mb={2}>
                  {/* 댓글 */}
                  <Box display="flex" gap={1}>
                    <Avatar src={comment.user.img} sx={{ width: 28, height: 28 }} />

                    {/* 내부 콘텐츠 정렬 */}
                    <Box sx={{ flex: 1 }}>
                      {/* 작성자 이름 */}
                      <Typography fontWeight="bold" variant="body2">
                        {comment.user.name}
                      </Typography>

                      {/* 댓글 본문 */}
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap' }}
                        onClick={handleMentionClick}
                      >
                        {renderHighlightedText(comment?.contents || '', comment?.mentions || [], navigate)}
                      </Typography>

                      {/* 작성일 + 답글쓰기 + 좋아요 아이콘 */}
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(comment.createdAt)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => setReplyTarget(comment.commentNo)}
                        >
                          답글쓰기
                        </Typography>
                        {/* ✅ 댓글 작성자 본인인 경우에만 표시 */}
                        {Number(comment.user.userId) === Number(userId) && (
                          <>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                              onClick={() => handleEditComment(comment)}
                            >
                              수정
                            </Typography>
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                              onClick={() => handleDeleteComment(comment.commentNo)}
                            >
                              삭제
                            </Typography>
                          </>
                        )}
                        <IconButton size="small">
                          <FavoriteBorderIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                  {editTargetComment?.commentNo === comment.commentNo ? (
                    <>
                      <MentionsInput
                        value={editText}
                        onChange={(e, newVal, plainText, mentions) => {
                          setEditText(newVal);
                          setEditMentions(mentions);
                        }}
                        markup="@{{__display__}}({{__id__}})"
                        classNames={{
                          control: 'mentions__control',
                          input: 'mentions__input',
                          highlighter: 'mentions__highlighter',
                          suggestions: 'mentions__suggestions'
                        }}
                        style={{
                          control: {
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            padding: '8px',
                            fontSize: 14,
                            width: '100%',
                            minHeight: 60
                          },
                          input: {
                            padding: 0,
                            minHeight: 60,
                            outline: 'none'
                          },
                          highlighter: {
                            padding: 0,
                            minHeight: 60
                          }
                        }}
                      >
                        <Mention
                          trigger="@"
                          data={fetchMentionData}
                          markup="@{{__display__}}({{__id__}})"
                          displayTransform={(id, display) => `${display}`}
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
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{entry.userName}</div>
                              </div>
                            </div>
                          )}
                        />
                      </MentionsInput>
                      <Button size="small" variant="contained" sx={{ mt: 1 }} onClick={() => handleSubmitEdit(comment.commentNo)}>
                        수정 완료
                      </Button>
                    </>
                  ) : null}

                  {/* 대댓글 입력창 */}
                  {replyTarget === comment.commentNo && (
                    <Box mt={1} ml={5}>
                      <MentionsInput
                        value={replyText}
                        onChange={(e, newVal, plainText, mentions) => {
                          setReplyText(newVal);
                          setReplyMentions(mentions);
                        }}
                        markup="@{{__display__}}({{__id__}})"
                        classNames={{
                          control: 'mentions__control',
                          input: 'mentions__input',
                          highlighter: 'mentions__highlighter',
                          suggestions: 'mentions__suggestions'
                        }}
                      >
                        <Mention
                          trigger="@"
                          data={fetchMentionData}
                          markup="@{{__display__}}({{__id__}})"
                          appendSpaceOnAdd
                          onAdd={(id, display) => {
                            setReplyMentions(prev => {
                              const exists = prev.find(m => m.id === id);
                              return exists ? prev : [...prev, { id, display }];
                            });
                          }}
                          displayTransform={(id, display) => `${display}`}
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
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{entry.userName}</div>
                              </div>
                            </div>
                          )}
                        />
                      </MentionsInput>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ mt: 1 }}
                        onClick={() => handleAddReply(comment.commentNo)}
                      >
                        답글 등록
                      </Button>
                    </Box>
                  )}

                  {/* 대댓글 리스트 */}
                  <Box mt={1} ml={5}>
                    {comment.children.map((child) => (
                      <Box key={child.commentNo} display="flex" gap={1} mt={1} alignItems="flex-start">
                        <Typography sx={{ fontSize: '1rem', color: '#888', mt: '4px' }}>└</Typography>
                        <Avatar src={child.user.img} sx={{ width: 24, height: 24 }} />
                        <Box>
                          <Typography fontWeight="bold" variant="body2">{child.user.name}</Typography>
                          <Typography
                            variant="body2"
                            onClick={handleMentionClick}
                          >
                            {renderHighlightedText(child.contents || '', child.mentions || [], navigate)}
                          </Typography>
                          {/* ⬇️ 작성일 + 좋아요 아이콘 추가 */}
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(child.createdAt)}
                            </Typography>
                            <IconButton size="small">
                              <FavoriteBorderIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* 댓글 입력창 + 버튼 */}
            <Box
              sx={{
                px: 2,
                pt: 2,
                pb: 2,
                borderTop: '1px solid #eee',
                backgroundColor: '#fff'
              }}
            >
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  padding: 1,
                  backgroundColor: '#fff',
                  overflow: 'visible'
                }}
              >
                <MentionsInput
                  value={newComment}
                  markup="@{{__display__}}({{__id__}})"  // @display(id) 형태로 저장
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
                    data={fetchMentionData}
                    displayTransform={(id, display) => `${display}`}  // display만 보이게 처리
                    markup="@{{__display__}}({{__id__}})"  // @display(id) 형태로 저장
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
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{entry.userName}</div>
                        </div>
                      </div>
                    )}
                  />
                </MentionsInput>
              </Box>
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

      </Dialog >

      {/* 피드 수정용 모달 */}
      <FeedModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          setEditModalOpen(false);
          onClose(); // 기존 피드 상세 닫기
          // 필요 시 피드 목록 리프레시 로직도 추가 가능
        }}
        // ✅ 수정 시 기존 내용 전달
        initialData={{
          feedId: feedDetail?.feedId,
          contents: feedDetail?.contents,
          mentions: feedDetail?.mentions,
          tags: feedDetail?.tags,
          images: imgList, // 기존 이미지 전달 (필요한 경우)
        }}
        mode="edit" // 수정 모드
      />
    </>
  );
}
