import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatList from '../components/dm/ChatList';
import ChatWindow from '../components/dm/ChatWindow';
import { Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

export default function DmPage() {
    const { targetId } = useParams();
    const token = localStorage.getItem('token');
    const { userId: loginUserId } = jwtDecode(token);

    const [roomList, setRoomList] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // ✅ 여기에 있어야 함!
    useEffect(() => {
        if (targetId) {
            fetch(`http://localhost:3005/dm/createOrGetRoom?user1=${loginUserId}&user2=${targetId}`)
                .then((res) => res.json())
                .then((room) => {
                    setSelectedRoom(room);
                    if (!roomList.some(r => r.roomno === room.roomno)) {
                        setRoomList((prev) => [...prev, room]);
                    }
                })
                .catch((err) => console.error('DM 방 생성 실패:', err));
        }
    }, [targetId]);

    useEffect(() => {
        // 방 목록 초기 로딩 (로그인 유저 기준)
        fetch(`http://localhost:3005/dm/list?userId=${loginUserId}`)
            .then((res) => res.json())
            .then((data) => setRoomList(data.rooms || []));
    }, []);

    const fetchRooms = () => {
        fetch(`http://localhost:3005/dm/list?userId=${loginUserId}`)
            .then((res) => res.json())
            .then((data) => setRoomList(data.rooms || []));
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <Box display="flex" height="90vh" border="1px solid #ccc">
            <ChatList
                rooms={roomList}
                myId={loginUserId}
                onSelectRoom={setSelectedRoom}
                selectedRoom={selectedRoom}
            />
            <ChatWindow room={selectedRoom} myId={loginUserId} onRefreshRooms={fetchRooms} />
        </Box>
    );
}
