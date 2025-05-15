// ChatWindow.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText
} from '@mui/material';

export default function ChatWindow({ room, myId }) {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');

    const messageEndRef = useRef(null);

    useEffect(() => {
        if (!room) return;
        fetch(`http://localhost:3005/dm/history?roomno=${room.roomno}`)
            .then((res) => {
                if (!res.ok) throw new Error('메시지 조회 실패');
                return res.json();
            })
            .then((data) => {
                setMessages(data.messages || []); // ✅ 이게 누락됐음!
            })
            .catch((err) => {
                console.error('💥 메시지 조회 실패:', err);
            });
    }, [room]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!newMsg.trim()) return;
        fetch('http://localhost:3005/dm/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomno: room.roomno,
                sender_id: myId,
                contents: newMsg
            })
        })
            .then((res) => {
                if (!res.ok) throw new Error('전송 실패');
                return res.json();
            })
            .then(() => {
                const newMessage = { sender_id: myId, contents: newMsg };
                setMessages([...messages, newMessage]);
                setNewMsg('');
            })
            .catch(err => {
                console.error('💥 메시지 전송 실패:', err);
                alert('메시지 전송 실패');
            });
    };

    if (!room) {
        return (
            <Box flex={1} p={3}>
                <Typography>채팅방을 선택해주세요</Typography>
            </Box>
        );
    }

    return (
        <Box flex={1} display="flex" flexDirection="column">
            <Box flex={1} p={2} overflow="auto">
                <List>
                    {messages.map((msg, i) => (
                        <ListItem
                            key={i}
                            sx={{
                                justifyContent: msg.sender_id === myId ? 'flex-end' : 'flex-start',
                                display: 'flex'
                            }}
                        >
                            <Box
                                sx={{
                                    bgcolor: msg.sender_id === myId ? '#d1e7dd' : '#f8d7da',
                                    p: 1.5,
                                    borderRadius: 2,
                                    maxWidth: '60%',
                                    minWidth: '120px',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-line'
                                }}
                            >
                                <Typography variant="body2">{msg.contents}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                                    {new Date(msg.sent_at).toLocaleTimeString('ko-KR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    })}
                                </Typography>
                            </Box>
                        </ListItem>
                    ))}
                    <div ref={messageEndRef} /> {/* 자동 스크롤을 위한 div */}
                </List>
            </Box>
            <Box p={2} display="flex" gap={1}>
                <TextField
                    fullWidth
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <Button variant="contained" onClick={handleSend}>전송</Button>
            </Box>
        </Box>
    );
}
