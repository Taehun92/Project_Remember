import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

export default function FollowButton({ myUserId, targetUserId, sx }) {
  const [isFollowing, setIsFollowing] = useState(false);

  console.log("세션로그인아이디",myUserId);
  console.log("고인페이지아이디",targetUserId);

  useEffect(() => {
    // 마운트 시 팔로우 상태 조회
    fetch(`http://localhost:3005/follow/${myUserId}/is-following?targetNo=${targetUserId}`)
      .then(r => r.json())
      .then(data => setIsFollowing(data.isFollowing));
  }, [myUserId, targetUserId]);

  const toggleFollow = async () => {
    const url    = `http://localhost:3005/follow/${targetUserId}`;
    const method = isFollowing ? 'DELETE' : 'POST';
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerNo: myUserId })
    });
    if (res.ok) setIsFollowing(!isFollowing);
    else {
      const { message } = await res.json();
      alert('실패: ' + message);
    }
  };

  return (
    <Button variant="contained" onClick={toggleFollow} sx={sx}>
      {isFollowing ? '잊어두기' : '함께 기억'}
    </Button>
  );
}
