const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();


const feedsRouter = require('./routes/feeds');
const userRouter = require('./routes/user');
const joinRouter = require('./routes/join');
const deceasedRouter = require('./routes/deceased');
const uploadRouter = require('./routes/upload');
const followRouter = require('./routes/follow');
const commonRouter = require('./routes/common');
const commentsRouter = require('./routes/comments');
const dmRouter = require('./routes/dm');

app.use(express.json());

app.use(cors({
    origin : ["http://localhost:3000", "http://localhost:3001"], // 접근 허용 도메인 주소
    credentials : true // cookie 전달 관련 된 옵션, false상태이면 cookie 전달이 되지 않음
}));

app.use('/uploads',express.static(path.join(__dirname, 'uploads')));


app.use("/feeds", feedsRouter);
app.use("/user", userRouter);
app.use("/join", joinRouter);
app.use("/deceased", deceasedRouter);
app.use("/upload", uploadRouter);
app.use("/follow", followRouter);
app.use("/", commonRouter);
app.use("/comments", commentsRouter);
app.use("/dm", dmRouter);



app.listen(3005, ()=>{
    console.log("서버 실행 중!");
    
}) 