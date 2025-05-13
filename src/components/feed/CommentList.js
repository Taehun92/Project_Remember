// src/components/comment/CommentList.jsx
import React from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';

export default function CommentList({ comments = [] }) {
  return (
    <List>
      {comments.map((comment, index) => (
        <ListItem key={index}>
          <ListItemAvatar>
            <Avatar>{comment.userId?.charAt(0).toUpperCase() || 'U'}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={comment.contents}
            secondary={comment.userId || '알 수 없음'}
          />
        </ListItem>
      ))}
    </List>
  );
}
