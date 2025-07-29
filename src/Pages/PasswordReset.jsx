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
import { sendPasswordResetEmail } from 'firebase/auth';

const PasswordReset = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
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

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err.message);
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
            Password Reset
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
              {loading ? 'Sending...' : 'Send Password Reset Email'}
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default PasswordReset;