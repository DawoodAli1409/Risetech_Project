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
import { sendPasswordResetEmail } from 'firebase/auth';

const PasswordReset = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode] = useState(prefersDarkMode);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slideIn, setSlideIn] = React.useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSlideIn(true);
    }, 150);

    return () => clearTimeout(timer);
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
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.09)' : '#ffffff',
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
    const emailRegex = /^\S+@\S+$/i;
    
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error('Firebase error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError("No user found with this email address.");
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
      <Box sx={{ 
        backgroundColor: 'transparent', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'center', 
        pt: isMobile ? '64px' : 1,
        pb: 4,
        width: isMobile && sidebarOpen ? 'calc(100% - 100px)' : '100vw',
        position: isMobile ? 'relative' : 'fixed',
        left: isMobile && sidebarOpen ? '100px' : 0,
        right: 0,
        transition: 'left 0.3s ease, width 0.3s ease',
        overflowY: isMobile ? 'auto' : 'visible',
      }}>
        <Container 
          maxWidth="sm" 
          sx={{ 
            width: isMobile && sidebarOpen ? 'calc(100% - 140px)' : isMobile ? '100%' : '500px',
            maxWidth: isMobile && sidebarOpen ? '240px' : isMobile ? '316px' : '500px',
            mx: 'auto',
            px: isMobile ? 0.5 : 3,
            transform: isMobile && sidebarOpen ? 'scale(0.85)' : 'scale(1)',
            transition: 'transform 0.3s ease, width 0.3s ease',
            overflow: 'hidden',
          }}
        >
          <Slide 
            direction="down" 
            in={slideIn} 
            mountOnEnter 
            timeout={{
              enter: 800,
              exit: 400
            }}
            easing={{
              enter: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              exit: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: isMobile && sidebarOpen ? 1.5 : isMobile ? 2 : 4,
                boxShadow: 6,
                borderRadius: 4,
                background: darkMode
                  ? 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
                  : 'linear-gradient(135deg, #e0f7fa, #80deea, #26c6da)',
                width: '100%',
                maxWidth: isMobile ? '100%' : 420,
                mx: 'auto',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: 12,
                },
              }}
            >
              <Typography
                component="h1"
                variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  mb: isMobile && sidebarOpen ? 1.5 : 2,
                  fontWeight: 800,
                  color: 'primary.main',
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  letterSpacing: isMobile && sidebarOpen ? '0.05em' : '0.15em',
                  textTransform: 'uppercase',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  textAlign: 'center',
                  fontSize: isMobile && sidebarOpen ? '0.95rem' : isMobile ? '1.5rem' : '2.125rem',
                  lineHeight: isMobile ? 1.1 : 1.235,
                  wordSpacing: isMobile && sidebarOpen ? '0.05em' : 'normal',
                  width: '100%',
                  wordWrap: 'break-word',
                  hyphens: 'auto',
                }}
              >
                Password Reset
              </Typography>

              {message && (
                <Alert severity="success" sx={{ width: '100%', mb: 2, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  {message}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <Stack spacing={isMobile && sidebarOpen ? 1.5 : isMobile ? 2 : 3}>
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
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.09)' : '#ffffff',
                        fontSize: isMobile && sidebarOpen ? '0.8rem' : isMobile ? '0.85rem' : '1rem',
                        '& .MuiOutlinedInput-input': {
                          paddingTop: isMobile && sidebarOpen ? '10px' : isMobile ? '12px' : '14px',
                          paddingBottom: isMobile && sidebarOpen ? '10px' : isMobile ? '12px' : '14px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: isMobile && sidebarOpen ? '0.8rem' : isMobile ? '0.85rem' : '1rem',
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
                    mt: isMobile && sidebarOpen ? 1.5 : 2,
                    mb: 1,
                    py: isMobile && sidebarOpen ? 0.8 : isMobile ? 1 : 1.25,
                    fontWeight: 700,
                    fontSize: isMobile && sidebarOpen ? '0.75rem' : isMobile ? '0.85rem' : '1rem',
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
                      Sending... <CircularProgress size={isMobile && sidebarOpen ? 14 : isMobile ? 16 : 20} sx={{ ml: 1, color: 'white' }} />
                    </>
                  ) : (
                    isMobile && sidebarOpen ? 'Send Reset Email' : 'Send Password Reset Email'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mt: isMobile && sidebarOpen ? 1.5 : 2 }}>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary', 
                    fontSize: isMobile && sidebarOpen ? '0.7rem' : isMobile ? '0.8rem' : '0.875rem',
                    lineHeight: 1.4,
                  }}>
                    Remembered your password?{' '}
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                      }}
                      underline="hover"
                      sx={{ 
                        color: 'text.secondary', 
                        fontSize: isMobile && sidebarOpen ? '0.7rem' : isMobile ? '0.8rem' : '0.875rem' 
                      }}
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

export default PasswordReset;