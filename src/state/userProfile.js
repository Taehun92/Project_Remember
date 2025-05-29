import { atom } from 'recoil';

export const userProfileState = atom({
  key: 'userProfileState',
  default: {
    userId : '',
    img_path: '',
    img_name: '',
  },
});