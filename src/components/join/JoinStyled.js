import { styled } from '@mui/material/styles';
import { Box, Card, Stack } from '@mui/material';

// 회원가입 카드 전체 박스
export const JoinCard = styled(Card)(({ theme }) => ({
  padding: '32px',
  marginTop: '80px',
  minHeight: '600px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: '12px',
}));

// 입력 폼 감싸는 Stack
export const FormBox = styled(Stack)(({ theme }) => ({
  marginTop: '16px',
}));

// 제목 영역
export const TitleBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: '24px',
}));

// 라벨용 스타일 (필요시 확장 가능)
export const StyledLabel = styled(Box)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: '8px',
}));