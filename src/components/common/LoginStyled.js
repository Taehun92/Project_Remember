// LoginStyled.js
import { styled } from '@mui/material/styles';
import { Box, Card, Typography, Stack, Link } from '@mui/material';

export const LoginCard = styled(Card)(({ theme }) => ({
  padding: '32px',
  minHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

export const LogoBox = styled(Box)({
  textAlign: 'center',
  marginBottom: '16px',
});

export const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.text.primary,
}));

export const LogoBar = styled(Box)(({ theme }) => ({
  height: '4px',
  width: '200px',
  backgroundColor: theme.palette.primary.main,
  margin: '0 auto',
  borderRadius: '2px',
}));

export const LinkRow = styled(Stack)({
  width: 'auto',
  margin: '16px auto 0',
});

export const StyledLink = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
  '&:visited': {
    color: theme.palette.text.secondary,
  },
}));