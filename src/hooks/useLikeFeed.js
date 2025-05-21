import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export function useLikeFeed(initialLiked, initialCount, feedId) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  const toggleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      const method = liked ? 'DELETE' : 'POST';
      const url = `http://localhost:3005/feeds/${feedId}/remember`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (data.success) {
        setLiked(!liked);
        setLikeCount(prev => (liked ? prev - 1 : prev + 1));
      } else {
        alert('좋아요 처리 실패');
      }
    } catch (err) {
      console.error('좋아요 요청 실패:', err);
      alert('좋아요 요청 실패');
    }
  };

  return { liked, likeCount, toggleLike };
}
