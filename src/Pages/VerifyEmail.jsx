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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { auth } from '../firebase';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';

const VerifyEmail = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Trim inputs to avoid whitespace issues
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail) || trimmedPassword === '') {
      setError('Please enter a valid email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        setMessage('Verification email sent. Please check your inbox.');
      } else {
        setMessage('Email already verified.');
      }
    } catch (err) {
      console.error('Firebase error:', {
        code: err.code,
        message: err.message,
        details: err,
      });
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Account doesn't exist or credentials are invalid.");
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
    setLoading(false);
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
          <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: '700', color: 'primary.main' }}>
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Stack spacing={1}>
              <TextField
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                bod
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
                    paddingTop: '10px',
                    paddingBottom: '10px',
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
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  '& .MuiInputBase-root': {
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  },
                  '& .MuiInputBase-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="medium"
              disabled={loading}
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
              {loading ? 'Processing...' : 'Send Verification Email'}
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default VerifyEmail;