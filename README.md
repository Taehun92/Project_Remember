<a name="top"></a>

<div align="center">
  <img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/feedlist.PNG" alt="Re:member Screenshot" width="500"/>
</div>

# 🕊 Re\:member

> 고인을 기억하는 사람들의 소셜 플랫폼, 추모용 SNS 서비스

---

<a name="toc"></a>

## 📚 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [개발 기간](#-개발-기간)
3. [사용 기술](#%EF%B8%8F-사용-기술)
4. [페이지별 기능](#-페이지별-기능)
5. [프로젝트 후기](#-프로젝트-후기)

---

## 💡 프로젝트 소개

* 개인 프로젝트로 진행한 SNS 기반 추모 서비스입니다.
* React와 Node.js를 활용하여 SPA 기반으로 구현되었습니다.
* 인스타그램 UI를 참고하되, 'Re\:member'라는 이름처럼 **고인을 기억하는 공간**이라는 목적에 맞춰 설계했습니다.
* 고인의 유족(관리자)은 SNS를 통해 **고인을 기억하는 사람들의 반응을 쉽게 확인**할 수 있습니다.

---

## 🗓 개발 기간

| 기간                             | 내용                          |
| ------------------------------ | --------------------------- |
| 2025.05.07 \~ 2025.05.19 (12일) | 기획, DB 설계, 서비스 개발, 테스트 및 수정 |

---

## 🛠️ 사용 기술

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge\&logo=React\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=Node.js\&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-000000?style=for-the-badge\&logo=express\&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge\&logo=MySQL\&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge\&logo=HTML5\&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge\&logo=CSS3\&logoColor=white)
![JavaScript](https://img.shields.io/badge/Javascript-F7DF1E?style=for-the-badge\&logo=Javascript\&logoColor=black)

<p align="right"><a href="#toc">🔝 목차로 이동</a></p>

---

## 📑 페이지별 기능

### 🔐 로그인 / 회원가입

<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/login.PNG" width="400" />
<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/join.PNG" width="400" />

* 심플한 UI로 접근성을 높이고, 금색 포인트로 고급스러움 표현
* 회원가입은 모달 단계별 구성 → 마이페이지에서 추후 수정 가능

---

### 🏠 메인 피드 페이지

<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/feedlist.PNG" width="600" />

* 관리 중이거나 기억 중인 고인의 피드 스크롤 구현
* 게시글 클릭 시 상세 + 댓글 기능 모달 제공
* 사이드바 탭으로 다양한 기능 접근

---

### 📄 게시글 상세 / 댓글 기능

<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/feedDetail.PNG" width="600" />

* 모달 내 게시글 본문 및 이미지 표시
* 댓글 + 대댓글 작성 가능 (멘션 기능 포함)

---

### ✏️ 게시글 작성 모달

<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/feedadd.png" width="600" />

* 이미지 최대 5장 첨부 가능
* 공개 범위 설정 가능
* 멘션 + 태그 기능으로 특정 인원 언급 가능

---

### 👤 프로필 / 고인 페이지

<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/myPage.PNG" width="400" />
<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/deceasedPage.PNG" width="400" />

* 마이페이지: 내가 관리/기억하는 고인 정보 확인 및 개인정보 수정 가능
* 고인페이지: 프로필 이미지, 고인 정보 수정 및 관리자 변경 신청 기능 포함

---

### 💬 다이렉트 메시지 (DM)

<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/dm.PNG" width="600" />

* 좌측 메시지 목록에서 유저 검색 후 1:1 채팅 가능

---

## 🎇 프로젝트 후기

이번 프로젝트는 React 기반의 SNS 서비스를 개발하며 컴포넌트 설계, 상태 관리, 조건부 렌더링 등 핵심 개념을 실습할 수 있는 좋은 기회였습니다.

* **React 렌더링 구조 및 useState 관리에 대한 이해도 향상**
* **컴포넌트 구조 설계 미흡 → 반복 코드 발생 → 이후 구조 리팩터링**
* **DB 설계 초기 완성도 부족 → 컬럼 추가/삭제 반복 발생**
* 상태 로직이 `useState` 밖에서 처리된 부분 등 아쉬움 존재

💡 **배운 점 & 개선 계획**:

* 프로젝트 착수 전 컴포넌트 구조와 상태 관리 전략부터 수립할 것
* 반복되는 기능은 초기에 컴포넌트화하여 재사용성 확보
* 설계 → 구현 → 리팩터링 순서로 프로젝트를 발전시킬 것

<p align="right"><a href="#toc">🔝 목차로 이동</a></p>
