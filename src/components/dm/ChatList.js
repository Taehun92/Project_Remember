// ChatList.jsx
import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
    Typography,
    Box
} from '@mui/material';

export default function ChatList({ rooms, myId, onSelectRoom, selectedRoom }) {
    return (
        <Box width="300px" borderRight="1px solid #ddd" p={2}>
            <Typography variant="h6" mb={2}>DM 목록</Typography>
            <List>
                {rooms.map((room) => {
                    const partnerId = room.user1_id === myId ? room.user2_id : room.user1_id;
                    return (
                        <React.Fragment key={room.ROOMNO}>
                            <ListItemButton
                                selected={selectedRoom?.ROOMNO === room.ROOMNO ? true : false}
                                onClick={() => onSelectRoom(room)}
                            >
                                <ListItemAvatar>
                                    <Avatar src={`http://localhost:3005${room.IMG_PATH}${room.IMG_NAME}`} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${room.USERNAME} (${room.TAGNAME})`}
                                    secondary={room.lastMessage || '대화를 시작하세요'}
                                />
                            </ListItemButton>
                            <Divider />
                        </React.Fragment>
                    );
                })}
            </List>
        </Box>
    );
}
