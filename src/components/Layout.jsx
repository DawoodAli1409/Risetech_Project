import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const role = useSelector(state => state.user.role);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Box sx={{ 
        display: 'flex',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '120px',
          height: '96px',
          background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
          zIndex: 1100,
          display: { xs: 'block', sm: 'none' }
        }
      }}>
        <Sidebar role={role} open={sidebarOpen} onClose={toggleSidebar} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            marginLeft: { 
              xs: sidebarOpen ? '120px' : 0, 
              sm: sidebarOpen ? '200px' : 0 
            },
            marginTop: { xs: '96px', sm: '64px' },
            minHeight: 'calc(100vh - 64px)',
            width: { 
              xs: sidebarOpen ? 'calc(100vw - 120px)' : '100vw',
              sm: sidebarOpen ? 'calc(100vw - 200px)' : '100vw'
            },
            overflowX: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            transition: 'margin-left 0.3s ease, width 0.3s ease',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default Layout;