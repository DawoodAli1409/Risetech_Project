import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  Stack,
  useMediaQuery,
  Slide,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase';
import { addUser, addMail } from '../firebaseDawood';

const Register = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode] = useState(prefersDarkMode);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [slideIn, setSlideIn] = useState(false);

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm();

  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  useEffect(() => {
    // Trigger slide-in animation after component mounts
    const timer = setTimeout(() => {
      setSlideIn(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        emailVerified: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await addUser(user.uid, userData);

      const mailData = {
        to: data.email,
        subject: 'Email Verification',
        message: {
          text: 'Please verify your email address to complete registration.',
          html: `<p>Please verify your email address to complete registration.</p>`,
        },
        createdAt: new Date(),
      };

      await addMail(mailData);

      setAuthSuccess('Account created successfully! Please check your email for verification.');
      setAuthError(null);
      reset();

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setAuthError(err.message);
      setAuthSuccess(null);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);

      if (result._tokenResponse?.isNewUser) {
        const userData = {
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ')[1] || '',
          email: result.user.email,
          emailVerified: true,
          createdAt: new Date(),
          lastLogin: new Date(),
          photoURL: result.user.photoURL,
        };

        await addUser(result.user.uid, userData);

        const mailData = {
          to: result.user.email,
          subject: 'Welcome to our platform',
          message: {
            text: 'Thank you for signing up with Google.',
            html: `<p>Thank you for signing up with Google.</p>`,
          },
          createdAt: new Date(),
        };

        await addMail(mailData);
      }

      navigate('/');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: isMobile ? '64px' : '20px',
        pb: '40px',
        width: isMobile && sidebarOpen ? 'calc(100% - 100px)' : '100vw',
        position: 'relative',
        left: isMobile && sidebarOpen ? '100px' : 0,
        right: 0,
        transition: 'left 0.3s ease, width 0.3s ease',
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}>
        <Container 
          maxWidth="sm" 
          sx={{
            width: isMobile && sidebarOpen ? 'calc(100% - 120px)' : isMobile ? '100%' : '500px',
            maxWidth: isMobile ? '316px' : '500px',
            mx: 'auto',
            px: isMobile ? 1 : 3,
            transform: isMobile && sidebarOpen ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.3s ease, width 0.3s ease',
            overflow: 'visible',
            height: 'auto',
            minHeight: 'auto',
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
            <Box sx={{
              mt: 1,
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: isMobile ? 2 : 4,
              boxShadow: 3,
              borderRadius: 4,
              background: darkMode
                ? 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
                : 'linear-gradient(135deg, #e0f7fa, #80deea, #26c6da)',
              width: '100%',
              '&:hover': {
                boxShadow: 6,
                transition: 'box-shadow 0.3s ease',
              },
              overflow: 'visible',
              position: 'relative',
              zIndex: 1,
            }}>
              <Typography
                component="h1"
                variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  color: 'primary.main',
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  textAlign: 'center',
                  width: '100%',
                  fontSize: isMobile ? '1.7rem' : '2.5rem',
                }}
              >
                CREATE ACCOUNT
              </Typography>

              {authError && (
                <Alert severity="error" sx={{ width: '100%', mb: 2, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  {authError}
                </Alert>
              )}
              {authSuccess && (
                <Alert severity="success" sx={{ width: '100%', mb: 2, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                  {authSuccess}
                </Alert>
              )}

              <Box 
                component="form" 
                onSubmit={handleSubmit(onSubmit)} 
                sx={{ 
                  mt: 1, 
                  width: '100%',
                  '& .MuiTextField-root': {
                    width: '100%',
                  },
                  overflow: 'visible',
                }}
              >
                <Stack spacing={isMobile ? 1.5 : 2}>
                  <TextField
                    label="First Name"
                    {...register('firstName', { required: 'First name is required' })}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    variant="filled"
                    size="small"
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      '& .MuiInputBase-root': {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        fontSize: isMobile ? '0.85rem' : '1rem',
                      },
                      '& .MuiInputBase-input': {
                        paddingTop: '12px',
                        paddingBottom: '4px',
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                      },
                    }}
                  />
                  <TextField
                    label="Last Name"
                    {...register('lastName', { required: 'Last name is required' })}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    variant="filled"
                    size="small"
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      '& .MuiInputBase-root': {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        fontSize: isMobile ? '0.85rem' : '1rem',
                      },
                      '& .MuiInputBase-input': {
                        paddingTop: '12px',
                        paddingBottom: '4px',
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                      },
                    }}
                  />
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
                    variant="filled"
                    size="small"
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      '& .MuiInputBase-root': {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        fontSize: isMobile ? '0.85rem' : '1rem',
                      },
                      '& .MuiInputBase-input': {
                        paddingTop: '12px',
                        paddingBottom: '4px',
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                      },
                    }}
                  />
                  <TextField
                    label="Phone Number"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Invalid phone number (10 digits required)',
                      },
                    })}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    variant="filled"
                    size="small"
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      '& .MuiInputBase-root': {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        fontSize: isMobile ? '0.85rem' : '1rem',
                      },
                      '& .MuiInputBase-input': {
                        paddingTop: '12px',
                        paddingBottom: '4px',
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                      },
                    }}
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
                    variant="filled"
                    size="small"
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      '& .MuiInputBase-root': {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        fontSize: isMobile ? '0.85rem' : '1rem',
                      },
                      '& .MuiInputBase-input': {
                        paddingTop: '12px',
                        paddingBottom: '4px',
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                      },
                    }}
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Confirm password is required',
                      validate: (value) =>
                        value === watch('password') || 'Passwords do not match',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    variant="filled"
                    size="small"
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                      '& .MuiInputBase-root': {
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                        fontSize: isMobile ? '0.85rem' : '1rem',
                      },
                      '& .MuiInputBase-input': {
                        paddingTop: '12px',
                        paddingBottom: '4px',
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                      },
                    }}
                  />
                </Stack>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="medium"
                  disabled={isSubmitting}
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.2,
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    borderRadius: '16px',
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Divider sx={{ my: 2, borderColor: 'primary.light' }} />

                <Button
                  fullWidth
                  variant="outlined"
                  size="medium"
                  startIcon={<GoogleIcon />}
                  onClick={signInWithGoogle}
                  disabled={isSubmitting}
                  sx={{
                    mb: 2,
                    py: 1.2,
                    backgroundColor: 'background.paper',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    borderRadius: '16px',
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      color: 'primary.contrastText',
                      borderColor: 'primary.dark',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  Sign up with Google
                </Button>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/password-reset');
                      }}
                      underline="hover"
                      sx={{ cursor: 'pointer', fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                    >
                      Forgot Password?
                    </Link>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                    Already have an account?{' '}
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                      }}
                      underline="hover"
                      sx={{ cursor: 'pointer', fontSize: isMobile ? '0.8rem' : '0.875rem' }}
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

export default Register;