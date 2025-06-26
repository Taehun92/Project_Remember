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

<img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/login.PNG" width="400" /> <img src="https://github.com/Taehun92/Project_Remember/blob/master/readme_img/join.PNG" width="400" />

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

React를 활용하여 SNS 서비스를 개발하였습니다. 이번 프로젝트를 통해 React의 렌더링 방식과 useState를 활용한 상태 관리에 대해 기본적인 이해를 다질 수 있었습니다. 그러나 같은 페이지 내에서 다양한 조건에 따라 렌더링이 동적으로 이루어져야 하는 상황에서 이를 모두 충족시키는 데 어려움을 느꼈고, 특히 컴포넌트의 구조와 상태 변화의 흐름에 대한 설계가 미흡했던 점이 아쉬움으로 남습니다.

초기 설계 시에는 전체적인 서비스 흐름을 구상하고 데이터베이스를 구성한 후 작업을 진행하였으나, 개발 중간에 컬럼을 추가하거나 삭제하는 상황이 발생하며 구조적으로 아쉬운 점들이 드러났습니다. 코드의 재사용성을 고려하여 최대한 컴포넌트를 활용하려 했으나, 유사한 기능을 반복해서 작성하는 경우도 발생했습니다. 특히 중복되는 코드를 사전에 컴포넌트화 하지 못했던 점이나, 상태 변화가 필요한 로직이 useState 내부에서 처리되지 않은 부분 등은 프로젝트를 진행하며 보완해야 할 부분으로 인식되었습니다.

프로젝트의 완성도를 높이기 위해 코드 전반을 재검토하고 구조를 수정하는 과정을 거치면서 전체 볼륨은 다소 줄어들었지만, 그만큼 코드의 품질과 기능의 핵심에 집중할 수 있는 시간이 되었습니다. 이번 경험을 바탕으로 앞으로는 프로젝트를 시작하기 전 컴포넌트 구조 설계와 상태 관리 전략을 명확히 세운 뒤 개발에 착수하는 습관을 기를 계획입니다. 이를 통해 코드의 재사용성과 유지보수성을 높이고, React를 보다 능숙하게 다룰 수 있도록 지속적으로 역량을 키워나가고자 합니다.

<p align="right"><a href="#toc">🔝 목차로 이동</a></p>
