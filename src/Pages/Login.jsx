import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Stack,
  useMediaQuery,
  CircularProgress,
  Slide,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { setUser } from '../store/userSlice';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode] = useState(prefersDarkMode);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#008080', // teal color
          },
          background: {
            default: darkMode ? '#121212' : '#f5f7fa',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
          secondary: {
            main: '#1565c0', // blue accent
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
                borderRadius: 12,
                transition: 'background-color 0.3s ease, transform 0.3s ease',
                '&:hover': {
                  backgroundColor: '#005f5f',
                  transform: 'scale(1.05)',
                },
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchUserFromDawood = async (userId) => {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/internship-2025-465209/databases/dawood/documents/user/${userId}`;
      const response = await axios.get(url);
      const fields = response.data.fields;
      return {
        Name: fields?.Name?.stringValue,
        Role: fields?.Role?.stringValue,
        Email: fields?.Email?.stringValue,
      };
    } catch (error) {
      console.error('Error fetching user from dawood:', error);
      return null;
    }
  };

  const onSubmit = async (data) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const email = data.email.trim();
      const password = data.password.trim();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setAuthError('Please verify your email first.');
        navigate('/verify-email', { replace: true });
        setIsLoading(false);
        return;
      }

      const dawoodUser = await fetchUserFromDawood(user.uid);
      const userName = dawoodUser?.Name || user.displayName || email.split('@')[0];
      const userRole = dawoodUser?.Role;

      dispatch(
        setUser({
          uid: user.uid,
          name: userName,
          email: user.email,
          role: userRole,
          isAuthenticated: true,
        })
      );

      navigate(userRole === 'admin' ? '/admin' : '/user', { replace: true });
      setIsLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/wrong-password':
          setAuthError('Incorrect password.');
          break;
        case 'auth/user-not-found':
          setAuthError('No user found with this email.');
          break;
        case 'auth/invalid-credential':
          setAuthError('Invalid credentials. Please check your email and password.');
          break;
        default:
          setAuthError(error.message);
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.emailVerified) {
        setAuthError('Please verify your email first.');
        setTimeout(() => navigate('/verify-email'), 3000);
        return;
      }

      const dawoodUser = await fetchUserFromDawood(user.uid);
      const userName = dawoodUser?.Name || user.displayName || user.email.split('@')[0];
      const userRole = dawoodUser?.Role || (user.email?.endsWith('@admin.com') ? 'admin' : 'user');

      dispatch(
        setUser({
          uid: user.uid,
          name: userName,
          email: user.email,
          role: userRole,
          isAuthenticated: true,
        })
      );

      navigate(userRole === 'admin' ? '/admin' : '/user', { replace: true });
    } catch (error) {
      console.error('Google sign-in error:', error);
      setAuthError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: 1 }}>
        <Container maxWidth="sm" sx={{ ml: '140px' }}>
          <Slide direction="down" in mountOnEnter timeout={800}>
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
                Sign In
              </Typography>

              {authError && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {authError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                  <Stack spacing={3}>
                    <TextField
                      label="Email Address"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting || isLoading}
                    sx={{
                      mt: 2,
                      mb: 1,
                      py: 1.25,
                      fontWeight: 700,
                      fontSize: '1rem',
                      transition: 'background-color 0.3s ease, transform 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#004d40',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        Signing In... <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    sx={{
                      py: 1.25,
                      fontWeight: 700,
                      fontSize: '1rem',
                      transition: 'background-color 0.3s ease, transform 0.3s ease',
                      borderColor: '#008080',
                      color: '#008080',
                      '&:hover': {
                        backgroundColor: '#004d40',
                        borderColor: '#004d40',
                        color: '#ffffff',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <>
                        Signing In... <CircularProgress size={20} sx={{ ml: 1 }} />
                      </>
                    ) : (
                      'Sign in with Google'
                    )}
                  </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/password-reset');
                      }}
                      underline="hover"
                      sx={{ color: 'text.secondary' }}
                    >
                      Forgot Password?
                    </Link>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Don&apos;t have an account?{' '}
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/register');
                      }}
                      underline="hover"
                      sx={{ color: 'text.secondary' }}
                    >
                      Create one
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

export default Login;
