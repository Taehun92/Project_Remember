-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.41 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- remember 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `remember` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `remember`;

-- 테이블 remember.account 구조 내보내기
CREATE TABLE IF NOT EXISTS `account` (
  `ACCOUNT_ID` int NOT NULL AUTO_INCREMENT,
  `USERID` int NOT NULL,
  `DUSERNAME` varchar(20) NOT NULL,
  `DBIRTH` date DEFAULT NULL,
  `DEATH` date DEFAULT NULL,
  `GENDER` enum('M','F') DEFAULT NULL,
  `RELATIONSHIP` varchar(20) DEFAULT NULL,
  `VISIBILITY` enum('PUBLIC','FOLLOWER','PRIVATE') DEFAULT 'PUBLIC',
  `FILES` varchar(200) DEFAULT NULL,
  `STATUS` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `REJECT_REASON` varchar(300) DEFAULT NULL,
  `REJECTED_AT` timestamp NULL DEFAULT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ACCOUNT_ID`),
  KEY `USERID` (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.account:~0 rows (대략적) 내보내기

-- 테이블 remember.chat 구조 내보내기
CREATE TABLE IF NOT EXISTS `chat` (
  `chatno` int NOT NULL AUTO_INCREMENT,
  `roomno` int NOT NULL,
  `sender_id` int NOT NULL,
  `contents` text,
  `is_read` enum('Y','N') DEFAULT 'N',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`chatno`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.chat:~2 rows (대략적) 내보내기
INSERT INTO `chat` (`chatno`, `roomno`, `sender_id`, `contents`, `is_read`, `sent_at`) VALUES
	(3, 1, 2, '안녕', 'N', '2025-05-15 08:46:49'),
	(4, 1, 3, '오호 하이', 'N', '2025-05-15 08:47:07');

-- 테이블 remember.chatroom 구조 내보내기
CREATE TABLE IF NOT EXISTS `chatroom` (
  `roomno` int NOT NULL AUTO_INCREMENT,
  `user1_id` int NOT NULL,
  `user2_id` int NOT NULL,
  `user_min_id` int GENERATED ALWAYS AS (least(`user1_id`,`user2_id`)) STORED,
  `user_max_id` int GENERATED ALWAYS AS (greatest(`user1_id`,`user2_id`)) STORED,
  `state` enum('ACTIVE','CLOSED') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`roomno`),
  UNIQUE KEY `unique_users` (`user_min_id`,`user_max_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.chatroom:~0 rows (대략적) 내보내기

-- 테이블 remember.cmentions 구조 내보내기
CREATE TABLE IF NOT EXISTS `cmentions` (
  `MENTIONNO` int NOT NULL AUTO_INCREMENT,
  `COMMENTNO` int NOT NULL,
  `MENTIONERNO` int NOT NULL,
  `MENTIONEDNO` int NOT NULL,
  `MENTIONEDTYPE` varchar(20) DEFAULT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MENTIONNO`),
  KEY `MENTIONER_ID` (`MENTIONERNO`) USING BTREE,
  KEY `MENTIONED_ID` (`MENTIONEDNO`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.cmentions:~0 rows (대략적) 내보내기

-- 테이블 remember.comments 구조 내보내기
CREATE TABLE IF NOT EXISTS `comments` (
  `COMMENTNO` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `USERID` int NOT NULL,
  `CONTENTS` text,
  `PARENT_COMMENTNO` int DEFAULT NULL,
  `DELETEYN` enum('Y','N') DEFAULT 'N',
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`COMMENTNO`),
  KEY `FEEDNO` (`FEEDNO`),
  KEY `USERID` (`USERID`),
  KEY `PARENT_COMMENTNO` (`PARENT_COMMENTNO`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.comments:~0 rows (대략적) 내보내기

-- 테이블 remember.dtimeline 구조 내보내기
CREATE TABLE IF NOT EXISTS `dtimeline` (
  `TIMELINENO` int NOT NULL AUTO_INCREMENT,
  `DUSERID` int NOT NULL,
  `TYPE` enum('FEED','COMMENT','MENTION','TRANSFER','SYSTEM') NOT NULL,
  `REF_ID` varchar(100) DEFAULT NULL,
  `SUMMARY` varchar(100) DEFAULT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TIMELINENO`),
  KEY `DUSERID` (`DUSERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.dtimeline:~0 rows (대략적) 내보내기

-- 테이블 remember.duser 구조 내보내기
CREATE TABLE IF NOT EXISTS `duser` (
  `DUSERID` int NOT NULL AUTO_INCREMENT,
  `PRIMARY_USERID` int NOT NULL,
  `AGENT_USERID` int DEFAULT NULL,
  `DTAGNAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DUSERNAME` varchar(50) DEFAULT NULL,
  `DBIRTH` date DEFAULT NULL,
  `DEATH` date DEFAULT NULL,
  `GENDER` enum('M','F') DEFAULT NULL,
  `RELATION` varchar(20) DEFAULT NULL,
  `REST_PLACE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CONTENTS` text,
  `LINKED_URL` varchar(200) DEFAULT NULL,
  `VISIBILITY` enum('PUBLIC','PRIVATE','FRIENDS') DEFAULT 'PUBLIC',
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`DUSERID`),
  KEY `PRIMARY_USERID` (`PRIMARY_USERID`),
  KEY `AGENT_USERID` (`AGENT_USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.duser:~8 rows (대략적) 내보내기
INSERT INTO `duser` (`DUSERID`, `PRIMARY_USERID`, `AGENT_USERID`, `DTAGNAME`, `DUSERNAME`, `DBIRTH`, `DEATH`, `GENDER`, `RELATION`, `REST_PLACE`, `CONTENTS`, `LINKED_URL`, `VISIBILITY`, `CREATED_AT`, `UPDATED_AT`) VALUES
	(11, 4, NULL, '@김가할아버지', '故 김아무개', '1935-02-11', '2023-09-30', 'M', '조부', '서울추모공원 봉안당', '성실함과 온유함으로 평생을 살아오신 존경받는 분입니다.', NULL, 'PUBLIC', '2025-05-15 09:14:10', '2025-05-15 10:10:43'),
	(12, 4, NULL, '@길동아버지', '故 이서방', '1941-05-19', '2024-02-27', 'M', '부', '부산영락공원', '조용히, 묵묵히 가족을 지켜주신 마음 깊은 어른이셨습니다.', NULL, 'FRIENDS', '2025-05-15 09:14:10', '2025-05-15 11:03:04'),
	(13, 5, NULL, '@아름다운우리엄마', '故 박처사', '1930-11-02', '2022-12-10', 'F', '모', '대전현충원', '사랑과 신뢰로 자손들에게 귀감이 되어주신 분입니다.', NULL, 'PRIVATE', '2025-05-15 09:14:10', '2025-05-15 10:54:23'),
	(14, 4, NULL, '@최조모님', '故 최할머니', '1937-04-08', '2024-09-16', 'F', '조모', '광주영락공원', '언제나 가족의 중심이 되어 따뜻함을 나누어주신 분입니다.', NULL, 'PUBLIC', '2025-05-15 09:14:10', '2025-05-15 10:10:47'),
	(15, 4, NULL, '@고모', '故 고모님', '1952-01-14', '2023-06-09', 'F', '고모', '대구추모의집', '정직하고 성실한 삶으로 많은 사람에게 존경받으셨습니다.', NULL, 'PUBLIC', '2025-05-15 09:14:10', '2025-05-15 10:10:48'),
	(21, 5, NULL, '@이대감', '故 이대감', '1935-02-11', '2023-09-30', 'M', '부', '서울추모공원 봉안당', '늘 미소 짓던 얼굴로 주위 사람들에게 희망을 전해주셨던 분이십니다.', NULL, 'PUBLIC', '2025-05-15 09:15:24', '2025-05-15 10:58:18'),
	(22, 6, NULL, '@서서여사님', '故 이서서', '1941-07-19', '2024-02-27', 'F', '모', '부산영락공원', '한평생 가족을 위해 헌신하며 따뜻한 사랑을 나누셨던 분입니다.', NULL, 'FRIENDS', '2025-05-15 09:15:24', '2025-05-15 10:56:41'),
	(26, 6, NULL, '@유어르신', '故 유대감', '1944-08-21', '2023-03-13', 'M', '부', '성남추모공원', '조용히, 묵묵히 가족을 지켜주신 마음 깊은 어른이셨습니다.', NULL, 'PRIVATE', '2025-05-15 09:15:33', '2025-05-15 10:58:27');

-- 테이블 remember.duserimg 구조 내보내기
CREATE TABLE IF NOT EXISTS `duserimg` (
  `DUSERID` int NOT NULL,
  `IMG_PATH` varchar(200) DEFAULT NULL,
  `IMG_NAME` varchar(100) DEFAULT NULL,
  `IMG_TYPE` varchar(50) DEFAULT NULL,
  `IMG_SIZE` int DEFAULT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`DUSERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.duserimg:~8 rows (대략적) 내보내기
INSERT INTO `duserimg` (`DUSERID`, `IMG_PATH`, `IMG_NAME`, `IMG_TYPE`, `IMG_SIZE`, `CREATED_AT`, `UPDATED_AT`) VALUES
	(11, '/uploads/deceased/', '1747302430047.png', NULL, NULL, '2025-05-15 09:47:10', '2025-05-15 09:47:10'),
	(12, '/uploads/deceased/', '1747302454584.png', NULL, NULL, '2025-05-15 09:47:34', '2025-05-15 09:47:34'),
	(13, '/uploads/deceased/', '1747302588947.png', NULL, NULL, '2025-05-15 09:49:48', '2025-05-15 09:49:48'),
	(14, '/uploads/deceased/', '1747302474032.png', NULL, NULL, '2025-05-15 09:47:54', '2025-05-15 09:47:54'),
	(15, '/uploads/deceased/', '1747302488849.png', NULL, NULL, '2025-05-15 09:48:08', '2025-05-15 09:48:08'),
	(21, '/uploads/deceased/', '1747302521434.png', NULL, NULL, '2025-05-15 09:48:41', '2025-05-15 09:48:41'),
	(22, '/uploads/deceased/', '1747302612586.png', NULL, NULL, '2025-05-15 09:50:12', '2025-05-15 09:50:12'),
	(26, '/uploads/deceased/', '1747302546563.png', NULL, NULL, '2025-05-15 09:49:06', '2025-05-15 09:49:06');

-- 테이블 remember.event_log 구조 내보내기
CREATE TABLE IF NOT EXISTS `event_log` (
  `EVENTNO` int NOT NULL AUTO_INCREMENT,
  `TYPE` enum('FOLLOW','MENTION','COMMENT','TRANSFER_REQUEST','TRANSFER_ACCEPT','TRANSFER_REJECT','LIKE') NOT NULL,
  `FROM_USERID` int NOT NULL,
  `TO_USERID` int NOT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`EVENTNO`),
  KEY `FROM_USERID` (`FROM_USERID`),
  KEY `TO_USERID` (`TO_USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.event_log:~0 rows (대략적) 내보내기

-- 테이블 remember.feeds 구조 내보내기
CREATE TABLE IF NOT EXISTS `feeds` (
  `FEEDNO` int NOT NULL AUTO_INCREMENT,
  `USERID` int NOT NULL,
  `CONTENTS` text,
  `VISIBILITY` enum('PUBLIC','PRIVATE','FRIENDS') DEFAULT 'PUBLIC',
  `DELETEYN` enum('Y','N') DEFAULT 'N',
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`FEEDNO`),
  KEY `USERID` (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.feeds:~7 rows (대략적) 내보내기
INSERT INTO `feeds` (`FEEDNO`, `USERID`, `CONTENTS`, `VISIBILITY`, `DELETEYN`, `CREATED_AT`, `UPDATED_AT`) VALUES
	(46, 4, '@{{@고모}}({{DUSER:15}}) \n\n고모, 안녕하세요. 오늘은 제가 잠깐 시간 내서 들렀어요.\n\n고모, 예전처럼 "잘 있었냐~" 하며 웃으실 것만 같아요.  \n이런 곳에서 인사드리는 게 아직도 낯설지만  \n그래도 고모 생각이 나는 날엔 꼭 이렇게 와서 이야기하고 싶어요.\n\n다음엔 엄마랑 같이 올게요.  \n조카가 많이 사랑한다는 말, 오늘도 놓고 갑니다.\n\n🕯️ 기억하고 있어요, 늘.  \n\n#기억에_담기 #고모님 #추모 #가족의기억 #고모사랑해요', 'PUBLIC', 'N', '2025-05-15 10:48:55', '2025-05-15 10:48:55'),
	(47, 4, '아버지, 잘 지내고 계시죠?\n\n요즘 따라 괜히 아버지 목소리가 자주 떠오릅니다.  \n운전 험하게 하면 “야, 차선 바꿀 땐 깜빡이부터 켜라”  \n늦게 일어나면 “남들 벌써 반나절을 살았겠다”  \n…그 잔소리들이 요즘 왜 이리 고맙게 들리는지 모르겠어요.\n\n회사 일이 잘 안 풀릴 땐 아버지한테 툭툭 털어놓고 싶고,  \n무릎 아플 때면 “앉았다 일어날 땐 손 짚지 말고 허벅지 힘으로 버텨” 하시던 말이 생각납니다.\n\n저, 아직도 아버지처럼은 못 삽니다.  \n근데 이상하게… 나도 모르게 아버지처럼 살고 있는 부분이 조금씩 늘고 있어요.\n\n그때처럼 잔소리 한 소리 해주세요.\n“너 이놈아, 기운 빠져 보인다. 똑바로 서라.”\n\n@{{@길동아버지}}({{DUSER:12}}) ', 'PUBLIC', 'N', '2025-05-15 10:53:03', '2025-05-15 10:53:03'),
	(48, 5, '@{{@아름다운우리엄마}}({{DUSER:13}}) , 잘 계시죠?\n\n오늘은 은우 데리고 산책 갔다가, 문득  \n“이 옷 입히니까 엄마가 좋아하셨을 것 같다”는 생각이 들었어요.\n\n아직 잘 걷진 못하지만, 혼자 일어서려고 애쓰는 모습 보면  \n엄마가 “아유, 얘 참 야무지다~” 하고 웃을 것 같아요.\n\n요즘 자꾸 은우가 엄마 젊었을 때 닮았다는 소리 들어요.  \n제가 봐도… 눈매나 표정이 어쩐지 익숙하긴 해요.  \n그럴 땐 괜히 코끝이 찡해져요.\n\n엄마가 살아계셨으면 은우 얼마나 예뻐하셨을까  \n애기 볼 때마다 엄마 생각이 더 나요.\n\n다음에 또 은우 예쁜 사진 많이 가지고 올게요.  \n그러니까 거기선 아프지 말고, 꽃길만 걸으세요.\n\n사랑해요, 엄마.\n', 'PUBLIC', 'N', '2025-05-15 10:55:52', '2025-05-15 10:55:52'),
	(49, 6, '@{{@서서여사님}}({{DUSER:22}}) \n평소 같았으면 그냥 지나쳤을 텐데  \n꽃 피어 있는 거 보니까 괜히 엄마 생각이 나더라고요.\n\n엄마는 참 꽃 좋아했죠.  \n예전엔 “이쁘다~” 하면서 사진 찍자고 하시던 거  \n솔직히 좀 귀찮았는데,  \n지금 생각하니 그게 얼마나 소중한 시간이었는지 알겠어요.\n\n엄마가 좋아할 만한 꽃들이 많이 피어 있었어요.  \n연분홍, 노란색, 하얀 들꽃…  \n엄마랑 같이 봤으면 참 좋았겠다 싶었어요.\n\n다음에 또 예쁜 꽃 보이면 찍어서 올릴게요.  \n거기서도 잘 지내시죠?  \n엄마, 보고 싶습니다.', 'PUBLIC', 'N', '2025-05-15 10:57:46', '2025-05-15 10:57:46'),
	(50, 6, '@{{@유어르신}}({{DUSER:26}}) \n아버지, 오늘은 어린이집에서 은성이가 카네이션을 만들었어요.  \n“이거 할아버지 줄 거야!” 하길래  \n그래, 그러자 하고 데리고 왔습니다.\n\n조금 삐뚤빼뚤하긴 한데  \n손으로 오려 붙인 꽃잎이 기특하더라고요.  \n가운데엔 "할아버지 사랑해요"라고 꾹꾹 눌러 썼어요.  \n읽으시면 웃으시겠죠.\n\n예전 같았으면  \n아버지는 “야, 애가 손재주 있네” 하셨을 것 같아요.  \n그러고는 은성이 머리 쓰다듬어주셨을 텐데요.\n\n아버지가 안 계신 자리가 이렇게까지 크게 느껴질 줄은  \n그땐 몰랐습니다.\n\n그래도, 손주가 만든 이 꽃  \n아버지께 잘 전해드리고 갑니다.\n\n다음엔 은성이랑 같이 또 올게요.', 'PUBLIC', 'N', '2025-05-15 10:59:04', '2025-05-15 10:59:04'),
	(51, 4, '@{{@김가할아버지}}({{DUSER:11}}) \n할아버지, 오늘 산소에 다녀왔습니다.\n\n작년보다 풀이 많이 자랐더라고요.  \n낫으로 조금 깎고, 물도 붓고, 꽃도 올려뒀어요.\n\n아빠가 조용히 묵념하실 때  \n옆에서 저도 같이 눈 감고 있었는데  \n괜히 마음이 이상하더라고요.\n\n할아버지랑 어릴 때 갔던 낚시터 생각도 나고,  \n단골 냉면집에서 “한 젓가락만 다오” 하시던 말투도 떠올랐어요.\n\n시간이 참 빠르죠.  \n올해도 건강히 잘 지내겠습니다.  \n할아버지도 거기선 편안하세요.\n\n또 올게요.\n', 'PUBLIC', 'N', '2025-05-15 11:01:19', '2025-05-15 11:01:19'),
	(52, 4, '@{{@길동아버지}}({{DUSER:12}}) \n\n아버지, 다음주에 생신이시죠.\n\n작은 꽃다발 하나 들고 봉안당 미리 다녀왔습니다.  \n밖은 봄 햇살이 좋더라고요.  \n생전에 아버지가 좋아하셨던 날씨였습니다.\n\n조용히 앉아 있다가 돌아오는길에 호숫가를 보니 괜히 그 생각이 났어요.  \n예전엔 생신이면 꼭 낚시 가자고 하셨잖아요.  \n아침 일찍 일어나서  \n“이 맛에 낚시하는 거야” 하시며 웃던 모습이 선합니다.\n\n그때는 솔직히 조금 귀찮기도 했는데  \n지금 생각하면, 더 자주 따라갈 걸 그랬어요.\n\n아버지, 잘 계시죠?  \n생신 축하드려요.  \n오늘도 아버지 생각, 가슴 깊이 담고 돌아갑니다.\n', 'PUBLIC', 'N', '2025-05-15 11:04:27', '2025-05-15 11:05:51');

-- 테이블 remember.feedsimg 구조 내보내기
CREATE TABLE IF NOT EXISTS `feedsimg` (
  `IMGNO` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `IMG_PATH` varchar(200) DEFAULT NULL,
  `IMG_NAME` varchar(100) DEFAULT NULL,
  `IMG_TYPE` varchar(50) DEFAULT NULL,
  `IMG_SIZE` int DEFAULT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`IMGNO`),
  KEY `FEEDNO` (`FEEDNO`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.feedsimg:~13 rows (대략적) 내보내기
INSERT INTO `feedsimg` (`IMGNO`, `FEEDNO`, `IMG_PATH`, `IMG_NAME`, `IMG_TYPE`, `IMG_SIZE`, `CREATED_AT`, `UPDATED_AT`) VALUES
	(31, 45, '/uploads/feed/', '1747305714501.png', NULL, NULL, '2025-05-15 10:41:54', '2025-05-15 10:41:54'),
	(32, 46, '/uploads/feed/', '1747306135517.png', NULL, NULL, '2025-05-15 10:48:55', '2025-05-15 10:48:55'),
	(33, 48, '/uploads/feed/', '1747306552810.png', NULL, NULL, '2025-05-15 10:55:52', '2025-05-15 10:55:52'),
	(34, 49, '/uploads/feed/', '1747306666387.png', NULL, NULL, '2025-05-15 10:57:46', '2025-05-15 10:57:46'),
	(35, 50, '/uploads/feed/', '1747306744982.png', NULL, NULL, '2025-05-15 10:59:05', '2025-05-15 10:59:05'),
	(36, 50, '/uploads/feed/', '1747306744989.png', NULL, NULL, '2025-05-15 10:59:05', '2025-05-15 10:59:05'),
	(37, 51, '/uploads/feed/', '1747306879539.png', NULL, NULL, '2025-05-15 11:01:19', '2025-05-15 11:01:19'),
	(38, 51, '/uploads/feed/', '1747306879549.png', NULL, NULL, '2025-05-15 11:01:19', '2025-05-15 11:01:19'),
	(39, 51, '/uploads/feed/', '1747306879554.png', NULL, NULL, '2025-05-15 11:01:19', '2025-05-15 11:01:19'),
	(40, 51, '/uploads/feed/', '1747306879563.png', NULL, NULL, '2025-05-15 11:01:19', '2025-05-15 11:01:19'),
	(41, 51, '/uploads/feed/', '1747306879569.png', NULL, NULL, '2025-05-15 11:01:19', '2025-05-15 11:01:19'),
	(44, 52, '/uploads/feed/', '1747307151346.png', NULL, NULL, '2025-05-15 11:05:51', '2025-05-15 11:05:51'),
	(45, 52, '/uploads/feed/', '1747307151352.png', NULL, NULL, '2025-05-15 11:05:51', '2025-05-15 11:05:51');

-- 테이블 remember.feedtag 구조 내보내기
CREATE TABLE IF NOT EXISTS `feedtag` (
  `FEEDNO` int NOT NULL,
  `TAGNO` int NOT NULL,
  PRIMARY KEY (`FEEDNO`,`TAGNO`),
  KEY `TAGNO` (`TAGNO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.feedtag:~10 rows (대략적) 내보내기
INSERT INTO `feedtag` (`FEEDNO`, `TAGNO`) VALUES
	(45, 50),
	(46, 50),
	(45, 51),
	(46, 51),
	(45, 52),
	(46, 52),
	(45, 53),
	(46, 53),
	(45, 54),
	(46, 54);

-- 테이블 remember.feed_entries 구조 내보내기
CREATE TABLE IF NOT EXISTS `feed_entries` (
  `ENTRY_ID` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `USERID` int NOT NULL,
  `DUSERID` int DEFAULT NULL,
  `TYPE` enum('FEED','COMMENT','MENTION','REMEMBER','FOLLOW') NOT NULL,
  `SOURCE_ID` varchar(50) DEFAULT NULL,
  `SOURCE_TYPE` enum('FEED','COMMENT','USER','DUSER') DEFAULT NULL,
  `SUMMARY` varchar(200) DEFAULT NULL,
  `ISREAD` enum('Y','N') DEFAULT 'N',
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ENTRY_ID`),
  KEY `USERID` (`USERID`),
  KEY `DUSERID` (`DUSERID`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.feed_entries:~0 rows (대략적) 내보내기

-- 테이블 remember.fmentions 구조 내보내기
CREATE TABLE IF NOT EXISTS `fmentions` (
  `MENTIONNO` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int NOT NULL,
  `MENTIONERNO` int NOT NULL,
  `MENTIONEDNO` int NOT NULL,
  `MENTIONEDTYPE` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MENTIONNO`),
  KEY `FEEDNO` (`FEEDNO`),
  KEY `MENTIONERNO` (`MENTIONERNO`),
  KEY `MENTIONEDNO` (`MENTIONEDNO`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.fmentions:~7 rows (대략적) 내보내기
INSERT INTO `fmentions` (`MENTIONNO`, `FEEDNO`, `MENTIONERNO`, `MENTIONEDNO`, `MENTIONEDTYPE`, `CREATED_AT`) VALUES
	(97, 46, 4, 15, 'DUSER', '2025-05-15 10:48:55'),
	(98, 47, 4, 12, 'DUSER', '2025-05-15 10:53:03'),
	(99, 48, 5, 13, 'DUSER', '2025-05-15 10:55:52'),
	(100, 49, 6, 22, 'DUSER', '2025-05-15 10:57:46'),
	(101, 50, 6, 26, 'DUSER', '2025-05-15 10:59:04'),
	(102, 51, 4, 11, 'DUSER', '2025-05-15 11:01:19'),
	(103, 52, 4, 12, 'DUSER', '2025-05-15 11:05:51');

-- 테이블 remember.follow 구조 내보내기
CREATE TABLE IF NOT EXISTS `follow` (
  `FOLLOWNO` int NOT NULL AUTO_INCREMENT,
  `FOLLOWERNO` int NOT NULL,
  `FOLLOWEDNO` int NOT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FOLLOWNO`),
  KEY `FOLLOWERNO` (`FOLLOWERNO`),
  KEY `FOLLOWEDNO` (`FOLLOWEDNO`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.follow:~1 rows (대략적) 내보내기
INSERT INTO `follow` (`FOLLOWNO`, `FOLLOWERNO`, `FOLLOWEDNO`, `CREATED_AT`) VALUES
	(18, 4, 13, '2025-05-15 11:07:21');

-- 테이블 remember.notifications 구조 내보내기
CREATE TABLE IF NOT EXISTS `notifications` (
  `NOTINO` int NOT NULL AUTO_INCREMENT,
  `USERID` int NOT NULL,
  `EVENTNO` int DEFAULT NULL,
  `MESSAGE` varchar(200) NOT NULL,
  `ISREAD` enum('Y','N') DEFAULT 'N',
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`NOTINO`),
  KEY `USERID` (`USERID`),
  KEY `EVENTNO` (`EVENTNO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.notifications:~0 rows (대략적) 내보내기

-- 테이블 remember.remember 구조 내보내기
CREATE TABLE IF NOT EXISTS `remember` (
  `FEEDNO` int NOT NULL,
  `USERID` int NOT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FEEDNO`,`USERID`),
  KEY `USERID` (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.remember:~3 rows (대략적) 내보내기
INSERT INTO `remember` (`FEEDNO`, `USERID`, `CREATED_AT`) VALUES
	(48, 4, '2025-05-15 11:23:54'),
	(49, 4, '2025-05-15 11:24:05'),
	(50, 4, '2025-05-15 11:24:03');

-- 테이블 remember.room 구조 내보내기
CREATE TABLE IF NOT EXISTS `room` (
  `ROOMNO` int NOT NULL,
  `USERID` int NOT NULL,
  `JOINED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ROOMNO`,`USERID`),
  KEY `USERID` (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.room:~0 rows (대략적) 내보내기

-- 테이블 remember.roomlog 구조 내보내기
CREATE TABLE IF NOT EXISTS `roomlog` (
  `MESSAGENO` int NOT NULL,
  `ROOMNO` int NOT NULL,
  `USERID` int NOT NULL,
  `ISREAD` enum('Y','N') DEFAULT 'N',
  `READ_AT` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`MESSAGENO`,`USERID`),
  KEY `ROOMNO` (`ROOMNO`),
  KEY `USERID` (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.roomlog:~0 rows (대략적) 내보내기

-- 테이블 remember.summary 구조 내보내기
CREATE TABLE IF NOT EXISTS `summary` (
  `SUMMARYNO` int NOT NULL AUTO_INCREMENT,
  `TYPE` enum('FEED','COMMENT','MENTION','FOLLOW','TRANSFER') NOT NULL,
  `TARGET` varchar(50) DEFAULT NULL,
  `TEMPLATE` varchar(300) NOT NULL,
  `ISACTIVE` enum('Y','N') DEFAULT 'Y',
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`SUMMARYNO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.summary:~0 rows (대략적) 내보내기

-- 테이블 remember.tag 구조 내보내기
CREATE TABLE IF NOT EXISTS `tag` (
  `TAGNO` int NOT NULL AUTO_INCREMENT,
  `TAGNAME` varchar(50) NOT NULL,
  PRIMARY KEY (`TAGNO`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.tag:~5 rows (대략적) 내보내기
INSERT INTO `tag` (`TAGNO`, `TAGNAME`) VALUES
	(50, '기억에_담기'),
	(51, '고모님'),
	(52, '추모'),
	(53, '가족의기억'),
	(54, '고모사랑해요');

-- 테이블 remember.transfer 구조 내보내기
CREATE TABLE IF NOT EXISTS `transfer` (
  `TRANSFER_ID` int NOT NULL AUTO_INCREMENT,
  `DUSERID` int NOT NULL,
  `REQUESTER_ID` int NOT NULL,
  `RECEIVER_ID` int NOT NULL,
  `STATUS` enum('WAIT','ACCEPT','REJECT') DEFAULT 'WAIT',
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `APPROVED_AT` timestamp NULL DEFAULT NULL,
  `APPROVER_ID` int DEFAULT NULL,
  `REJECT_REASON` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`TRANSFER_ID`),
  KEY `DUSERID` (`DUSERID`),
  KEY `REQUESTER_ID` (`REQUESTER_ID`),
  KEY `RECEIVER_ID` (`RECEIVER_ID`),
  KEY `APPROVER_ID` (`APPROVER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.transfer:~0 rows (대략적) 내보내기

-- 테이블 remember.user 구조 내보내기
CREATE TABLE IF NOT EXISTS `user` (
  `USERID` int NOT NULL AUTO_INCREMENT,
  `LOGIN_ID` varchar(50) NOT NULL,
  `PASSWORD` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `EMAIL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `EMAIL_VERIFIED` enum('Y','N') DEFAULT 'N',
  `PHONE` varchar(50) DEFAULT NULL,
  `PHONE_VERIFIED` enum('Y','N') DEFAULT 'N',
  `TAGNAME` varchar(50) DEFAULT NULL,
  `USERNAME` varchar(50) DEFAULT NULL,
  `BIRTH` date DEFAULT NULL,
  `GENDER` enum('M','F') DEFAULT NULL,
  `ADDR` varchar(100) DEFAULT NULL,
  `STATE` enum('USER','AGENT','PRIMARY','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'USER',
  `VISIBILITY` enum('PUBLIC','PRIVATE','FRIENDS') DEFAULT 'PUBLIC',
  `DELETEYN` enum('Y','N') DEFAULT 'N',
  `MARKETING` enum('Y','N') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `DELETED_AT` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`USERID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.user:~3 rows (대략적) 내보내기
INSERT INTO `user` (`USERID`, `LOGIN_ID`, `PASSWORD`, `EMAIL`, `EMAIL_VERIFIED`, `PHONE`, `PHONE_VERIFIED`, `TAGNAME`, `USERNAME`, `BIRTH`, `GENDER`, `ADDR`, `STATE`, `VISIBILITY`, `DELETEYN`, `MARKETING`, `CREATED_AT`, `UPDATED_AT`, `DELETED_AT`) VALUES
	(4, 'test', '$2b$10$5BdLd05bY7XP.Ffhetic4ObjEVQHniD0tj6tg100RkpeCg3rUZxb.', 'test@test.com', 'N', '010-0000-0000', 'N', '@홍유저', '홍길동', '2025-04-30', 'M', '인천시 부평구', 'USER', 'PUBLIC', 'N', 'N', '2025-05-15 09:02:22', '2025-05-15 09:55:57', '2025-05-15 09:02:22'),
	(5, 'test1', '$2b$10$l7Pmqp7goSX4dajuRTgvVOdeizds06BaJ1/2MnbkhX38KeaJVGoYy', '', 'N', '', 'N', '@유저', '이유저', '2025-05-03', 'F', '경기도 부천', 'USER', 'PUBLIC', 'N', 'Y', '2025-05-15 09:52:43', '2025-05-15 09:57:36', '2025-05-15 09:52:43'),
	(6, 'test2', '$2b$10$4r.81mvpoWXbnrRAQG42k.1lVnWiD1/KRTDWf3ISCrnXWuQTE/KPS', '', 'N', '', 'N', '@철수킴', '김철수', '2025-04-29', 'M', '서울특별시', 'USER', 'PUBLIC', 'N', 'Y', '2025-05-15 09:57:17', '2025-05-15 09:59:29', '2025-05-15 09:57:17');

-- 테이블 remember.userimg 구조 내보내기
CREATE TABLE IF NOT EXISTS `userimg` (
  `USERID` int NOT NULL,
  `IMG_PATH` varchar(200) DEFAULT NULL,
  `IMG_NAME` varchar(100) DEFAULT NULL,
  `IMG_TYPE` varchar(50) DEFAULT NULL,
  `IMG_SIZE` int DEFAULT NULL,
  `CREATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.userimg:~3 rows (대략적) 내보내기
INSERT INTO `userimg` (`USERID`, `IMG_PATH`, `IMG_NAME`, `IMG_TYPE`, `IMG_SIZE`, `CREATED_AT`, `UPDATED_AT`) VALUES
	(4, '/uploads/profile/', '1747302957540.png', NULL, NULL, '2025-05-15 09:55:57', '2025-05-15 09:55:57'),
	(5, '/uploads/profile/', '1747302938857.png', NULL, NULL, '2025-05-15 09:55:38', '2025-05-15 09:55:38'),
	(6, '/uploads/profile/', '1747303169409.png', NULL, NULL, '2025-05-15 09:59:29', '2025-05-15 09:59:29');

-- 테이블 remember.user_log 구조 내보내기
CREATE TABLE IF NOT EXISTS `user_log` (
  `LOG_ID` int NOT NULL AUTO_INCREMENT,
  `FEEDNO` int DEFAULT NULL,
  `ACTOR_ID` int NOT NULL,
  `TARGET_ID` int DEFAULT NULL,
  `TARGET_TYPE` enum('USER','DUSER') NOT NULL,
  `TYPE` enum('MENTION','COMMENT','LIKE','REMEMBER','FOLLOW','FEED','DM') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SOURCE_ID` int NOT NULL,
  `SOURCE_TYPE` enum('COMMENT','FEED','FOLLOW') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SUMMARY` varchar(255) DEFAULT NULL,
  `ISREAD` char(1) DEFAULT 'N',
  `CREATED_AT` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LOG_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 remember.user_log:~18 rows (대략적) 내보내기
INSERT INTO `user_log` (`LOG_ID`, `FEEDNO`, `ACTOR_ID`, `TARGET_ID`, `TARGET_TYPE`, `TYPE`, `SOURCE_ID`, `SOURCE_TYPE`, `SUMMARY`, `ISREAD`, `CREATED_AT`) VALUES
	(99, 46, 4, 15, 'DUSER', 'MENTION', 46, 'FEED', '고인을 언급하였습니다.', 'N', '2025-05-15 19:48:55'),
	(100, 46, 4, 4, 'USER', 'FEED', 46, 'FEED', ' 피드를 작성했습니다.', 'N', '2025-05-15 19:48:55'),
	(101, 47, 4, 12, 'DUSER', 'MENTION', 47, 'FEED', '고인을 언급하였습니다.', 'N', '2025-05-15 19:53:03'),
	(102, 47, 4, 4, 'USER', 'FEED', 47, 'FEED', ' 피드를 작성했습니다.', 'N', '2025-05-15 19:53:03'),
	(103, 48, 5, 13, 'DUSER', 'MENTION', 48, 'FEED', '고인을 언급하였습니다.', 'N', '2025-05-15 19:55:52'),
	(104, 48, 5, 5, 'USER', 'FEED', 48, 'FEED', ' 피드를 작성했습니다.', 'N', '2025-05-15 19:55:52'),
	(105, 49, 6, 22, 'DUSER', 'MENTION', 49, 'FEED', '고인을 언급하였습니다.', 'N', '2025-05-15 19:57:46'),
	(106, 49, 6, 6, 'USER', 'FEED', 49, 'FEED', ' 피드를 작성했습니다.', 'N', '2025-05-15 19:57:46'),
	(107, 50, 6, 26, 'DUSER', 'MENTION', 50, 'FEED', '고인을 언급하였습니다.', 'N', '2025-05-15 19:59:04'),
	(108, 50, 6, 6, 'USER', 'FEED', 50, 'FEED', ' 피드를 작성했습니다.', 'N', '2025-05-15 19:59:04'),
	(109, 51, 4, 11, 'DUSER', 'MENTION', 51, 'FEED', '고인을 언급하였습니다.', 'N', '2025-05-15 20:01:19'),
	(110, 51, 4, 4, 'USER', 'FEED', 51, 'FEED', ' 피드를 작성했습니다.', 'N', '2025-05-15 20:01:19'),
	(111, 52, 4, 4, 'USER', 'FEED', 52, 'FEED', ' 피드를 작성했습니다.', 'N', '2025-05-15 20:04:27'),
	(112, 52, 4, 12, 'DUSER', 'MENTION', 52, 'FEED', '고인을 언급하였습니다.', 'N', '2025-05-15 20:05:51'),
	(113, NULL, 4, 13, 'DUSER', 'FOLLOW', 13, 'FOLLOW', '고인을 기억합니다.', 'N', '2025-05-15 20:07:21'),
	(114, 48, 4, 5, 'USER', 'LIKE', 48, 'FEED', '회원님의 게시글을 기억합니다', 'N', '2025-05-15 20:23:54'),
	(115, 50, 4, 6, 'USER', 'LIKE', 50, 'FEED', '회원님의 게시글을 기억합니다', 'N', '2025-05-15 20:24:03'),
	(116, 49, 4, 6, 'USER', 'LIKE', 49, 'FEED', '회원님의 게시글을 기억합니다', 'N', '2025-05-15 20:24:05');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
