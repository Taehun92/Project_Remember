import React, { useState } from 'react';
import { Paper, Avatar, Typography, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FeedModal from './FeedModal';

export default function FeedItem({ feed, onDeleted, onUpdated }) {
  const { FEEDNO, USERNAME, TAGNAME, CONTENTS, CREATED_AT, USERID } = feed;
  const meId = Number(JSON.parse(atob(localStorage.getItem('token').split('.')[1])).userId);
  const canEdit = meId === USERID;

  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    await fetch(`http://localhost:3005/feeds/${FEEDNO}`, { method: 'DELETE' });
    onDeleted();
  };

  return (
    <Paper sx={{ p:2, mb:2 }}>
      <Box display="flex" alignItems="center">
        <Avatar sx={{ mr:1 }} />
        <Box flex={1}>
          <Typography fontWeight="bold">{USERNAME}</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(CREATED_AT).toLocaleString()}
          </Typography>
        </Box>
        {canEdit && (
          <>
            <IconButton onClick={() => setEditOpen(true)}><EditIcon/></IconButton>
            <IconButton onClick={handleDelete}><DeleteIcon/></IconButton>
          </>
        )}
      </Box>
      <Typography sx={{ mt:1 }}>{CONTENTS}</Typography>

      <FeedModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); onUpdated(); }}
        userId={USERID}
        feed={feed}  // 전달하면 수정 모드
      />
    </Paper>
  );
}
