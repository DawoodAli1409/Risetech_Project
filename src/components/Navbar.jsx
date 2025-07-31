import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { clearUser } from '../store/userSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={4}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #007CF0, #00DFD8)', // modern blue-teal gradient
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            cursor: 'pointer',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'white',
            transition: 'color 0.3s ease',
            '&:hover': {
              color: '#FFD700', // gold accent on hover
            },
          }}
          onClick={() => navigate('/')}
        >
          Project Management App
        </Typography>
        <Box>
          {user.isAuthenticated ? (
            <>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  fontFamily: "'Poppins', sans-serif",
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    color: '#FFD700',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              {['Login', 'Register', 'Verify Email', 'Forgot Password'].map((text) => (
                <Button
                  key={text}
                  color="inherit"
                  onClick={() => {
                    let path = text.toLowerCase().replace(/\s/g, '-');
                    if (text === 'Forgot Password') {
                      path = 'password-reset';
                    }
                    navigate(`/${path}`);
                  }}
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: "'Poppins', sans-serif",
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#FFD700',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      transform: 'scaleX(0)',
                      height: '2px',
                      bottom: 0,
                      left: 0,
                      backgroundColor: '#FFD700',
                      transformOrigin: 'bottom right',
                      transition: 'transform 0.25s ease-out',
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                      transformOrigin: 'bottom left',
                    },
                  }}
                >
                  {text}
                </Button>
              ))}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
