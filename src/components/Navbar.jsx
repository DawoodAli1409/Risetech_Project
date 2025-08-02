import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { clearUser } from '../store/userSlice';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isMobile) {
    return (
      <>
        {/* Fixed Navbar at Top */}
        <Box sx={{ 
          position: 'fixed',
        width: sidebarOpen ? 'calc(100% - 120px)' : '100%',  // Shrink navbar width when sidebar open on xs
        zIndex: 1300,
        top: 0,
        left: sidebarOpen ? '120px' : 0,  // Move navbar right when sidebar open on xs
        transition: 'width 0.3s ease, left 0.3s ease',
        overflow: 'hidden',
      }}>
          <AppBar position="static" sx={{ 
            background: 'linear-gradient(90deg, #007CF0, #00DFD8)',
            fontFamily: "'Poppins', sans-serif",
          }}>
            <Toolbar sx={{ 
              justifyContent: 'space-between',
              minHeight: '56px !important',
              padding: '0 16px'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: 'white',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 'calc(100vw - 56px)'
              }}>
                Project Management App
              </Typography>
              <IconButton 
                color="inherit" 
                onClick={onToggleSidebar}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          
          {/* Navigation Tabs */}
          <Box sx={{ 
            width: '100%',
            backgroundColor: '#f5f7fa',
            padding: '8px 16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',  // Changed to vertical layout
            overflowX: 'visible',     // Allow vertical scroll if needed
            gap: '8px',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}>
            {user.isAuthenticated ? (
              <Button
                onClick={handleLogout}
                sx={{
                  padding: '8px 12px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#2c3e50',
                  textTransform: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  whiteSpace: 'nowrap',
                  minWidth: 'max-content',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }
                }}
              >
                Logout
              </Button>
            ) : (
              ['Login', 'Register', 'Verify Email', 'Forgot Password'].map((text) => (
                <Button
                  key={text}
                  onClick={() => {
                    let path = text.toLowerCase().replace(/\s/g, '-');
                    if (text === 'Forgot Password') path = 'password-reset';
                    navigate(`/${path}`);
                  }}
                  sx={{
                    padding: '8px 12px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#2c3e50',
                    textTransform: 'none',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    whiteSpace: 'nowrap',
                    minWidth: 'max-content',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  {text}
                </Button>
              ))
            )}
          </Box>
        </Box>

        {/* Spacer to prevent content hiding behind fixed navbar */}
        <Box sx={{ height: '112px' }} />
      </>
    );
  }

  // Desktop layout
  return (
    <AppBar
      position="fixed"
      elevation={4}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #007CF0, #00DFD8)',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', padding: '0 24px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onToggleSidebar}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              cursor: 'pointer',
              fontWeight: 700,
              color: 'white',
              fontSize: '1.25rem',
              mr: 4,
              '&:hover': {
                opacity: 0.9,
              },
            }}
            onClick={() => navigate('/')}
          >
            Project Management App
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex',
          gap: '2px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {user.isAuthenticated ? (
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '6px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-1px)'
                },
              }}
            >
              Logout
            </Button>
          ) : (
            ['Login', 'Register', 'Verify Email', 'Forgot Password'].map((text) => (
              <Button
                key={text}
                color="inherit"
                onClick={() => {
                  let path = text.toLowerCase().replace(/\s/g, '-');
                  if (text === 'Forgot Password') path = 'password-reset';
                  navigate(`/${path}`);
                }}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  minWidth: 'auto',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-1px)'
                  },
                }}
              >
                {text}
              </Button>
))
          )}
          
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;