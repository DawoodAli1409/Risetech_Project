import React, { useState, useMemo } from 'react';
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
  IconButton,
  useMediaQuery,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase';
import { addUser, addMail } from '../firebaseDawood';

const Register = () => {
  const navigate = useNavigate();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1565c0',
          },
          background: {
            default: darkMode ? '#121212' : '#f0f4f8',
            paper: darkMode ? '#1d1d1d' : '#ffffff',
          },
        },
        typography: {
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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

  const [authError, setAuthError] = React.useState(null);
  const [authSuccess, setAuthSuccess] = React.useState(null);

  const onSubmit = async (data) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      // Prepare user data
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

      // Save to both collections
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
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 2,
            boxShadow: 6,
            borderRadius: 6,
            backgroundColor: 'background.paper',
            width: '100%',
            maxWidth: 420,
            mx: 'auto',
            mt: 5,
            mb: 3,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: 12,
            },
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, fontWeight: '700', color: 'primary.main' }}
          >
            Create Account
          </Typography>

          {authError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {authError}
            </Alert>
          )}
          {authSuccess && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {authSuccess}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
            <Stack spacing={1}>
              <TextField
                label="First Name"
                {...register('firstName', { required: 'First name is required' })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                fullWidth
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  '& .MuiInputBase-root': {
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  },
                  '& .MuiInputBase-input': {
                    paddingTop: '14px', // Increased top padding
                    paddingBottom: '4px', // Reduced bottom padding
                  },
                }}
              />
              <TextField
                label="Last Name"
                {...register('lastName', { required: 'Last name is required' })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                fullWidth
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  '& .MuiInputBase-root': {
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  },
                  '& .MuiInputBase-input': {
                    paddingTop: '14px', // Increased top padding
                    paddingBottom: '4px', // Reduced bottom padding
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
                fullWidth
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  '& .MuiInputBase-root': {
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  },
                  '& .MuiInputBase-input': {
                    paddingTop: '14px', // Increased top padding
                    paddingBottom: '4px', // Reduced bottom padding
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
                fullWidth
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  '& .MuiInputBase-root': {
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  },
                  '& .MuiInputBase-input': {
                    paddingTop: '14px', // Increased top padding
                    paddingBottom: '4px', // Reduced bottom padding
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
                fullWidth
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  '& .MuiInputBase-root': {
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  },
                  '& .MuiInputBase-input': {
                    paddingTop: '14px', // Increased top padding
                    paddingBottom: '4px', // Reduced bottom padding
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
                fullWidth
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  '& .MuiInputBase-root': {
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  },
                  '& .MuiInputBase-input': {
                    paddingTop: '14px', // Increased top padding
                    paddingBottom: '4px', // Reduced bottom padding
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
                mt: 3,
                mb: 2,
                py: 1.5,
                fontWeight: 'bold',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Divider sx={{ my: 3, borderColor: 'primary.light' }} />

            <Button
              fullWidth
              variant="outlined"
              size="medium"
              startIcon={<GoogleIcon />}
              onClick={signInWithGoogle}
              disabled={isSubmitting}
              sx={{
                mb: 2,
                py: 1.5,
                backgroundColor: 'background.paper',
                fontWeight: 'bold',
                color: 'primary.main',
                borderColor: 'primary.main',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                '&:hover': {
                  backgroundColor: 'primary.light',
                  borderColor: 'primary.dark',
                },
              }}
            >
              Sign up with Google
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/risetech-project/password-reset');
                  }}
                  underline="hover"
                  sx={{ cursor: 'pointer' }}
                >
                  Forgot Password?
                </Link>
              </Typography>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/risetech-project/login');
                  }}
                  underline="hover"
                  sx={{ cursor: 'pointer' }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Register;