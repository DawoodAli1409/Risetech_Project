import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Slide,
  CircularProgress,
  useMediaQuery,
  Link,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { auth } from '../firebase';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode] = useState(prefersDarkMode);
  const isSmallScreen = useMediaQuery('(max-width:768px)');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slideIn, setSlideIn] = React.useState(false);

  React.useEffect(() => {
    setSlideIn(true);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#008080',
            dark: '#004d40',
          },
          background: {
            default: darkMode ? '#121212' : '#f5f7fa',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
          secondary: {
            main: '#1565c0',
          },
        },
        typography: {
          fontFamily: "'Poppins', 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#008080',
                  boxShadow: '0 0 8px rgba(0, 128, 128, 0.3)',
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#004d40',
                  transform: 'scale(1.05)',
                },
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const emailRegex = /^\S+@\S+$/i;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        setMessage('Verification email sent. Please check your inbox.');
      } else {
        setMessage('Email already verified. You can now login.');
        setTimeout(() => navigate('/verify-email'), 3000);
      }
    } catch (err) {
      console.error('Firebase error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          setError("Account doesn't exist or credentials are invalid.");
          break;
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError('An error occurred. Please try again later.');
      }
    }
    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: { xs: 'center', md: 'center' }, pt: 1 }}>
        <Container maxWidth="sm" sx={{ ml: isSmallScreen ? '20px' : '140px', mx: { xs: 'auto', md: 'auto' } }}>
          <Slide direction="down" in={slideIn} mountOnEnter timeout={800}>
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                boxShadow: 6,
                borderRadius: 4,
                background: darkMode
                  ? 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
                  : 'linear-gradient(135deg, #e0f7fa, #80deea, #26c6da)',
                width: '100%',
                maxWidth: 420,
                mx: 'auto',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: 12,
                },
              }}
            >
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  color: 'primary.main',
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Verify Email
              </Typography>

              {message && (
                <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                  {message}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <Stack spacing={3}>
                  <TextField
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                      },
                    }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                      },
                    }}
                  />
                </Stack>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    mb: 1,
                    py: 1.25,
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#004d40',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {loading ? (
                    <>
                      Processing... <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />
                    </>
                  ) : (
                    'Send Verification Email'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Remembered your credentials?{' '}
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                      }}
                      underline="hover"
                      sx={{ color: 'text.secondary' }}
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Slide>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default VerifyEmail;