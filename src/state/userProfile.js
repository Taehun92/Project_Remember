import { atom } from 'recoil';

export const userProfileState = atom({
  key: 'userProfileState',    // (1) 이 키로 전역에서 이 상태를 구분합니다.
  default: {
    IMG_PATH: '',
    IMG_NAME: '',
    // 필요하다면 USERNAME, TAGNAME 등도 여기 넣어두세요.
  },
});