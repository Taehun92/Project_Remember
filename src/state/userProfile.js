import { atom } from 'recoil';

export const userProfileState = atom({
  key: 'userProfileState',
  default: {
    userId : '',
    IMG_PATH: '',
    IMG_NAME: '',
  },
});