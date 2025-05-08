// src/components/profile/FollowerList.jsx
import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Paper } from '@mui/material';

function FollowerList({ followers = [] }) {
  if (followers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" mt={2}>
        팔로워가 없습니다.
      </Typography>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{ padding: 2, borderRadius: 2, mt: 2 }}
    >
      <Typography variant="h6" gutterBottom>
        팔로워 목록
      </Typography>
      <List>
        {followers.map((follower, index) => (
          <Box key={follower.userid || index}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  src={`http://localhost:3005/${follower.profileImg || 'default-profile.png'}`}
                />
              </ListItemAvatar>
              <ListItemText
                primary={follower.tagname || follower.username}
                secondary={`팔로우 일시: ${new Date(follower.created_at).toLocaleDateString()}`}
              />
            </ListItem>
            {index < followers.length - 1 && <Divider component="li" />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}

export default FollowerList;
