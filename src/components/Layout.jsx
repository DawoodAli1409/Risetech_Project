import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const role = useSelector(state => state.user.role);

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex' }}>
        <Sidebar role={role} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            marginLeft: '240px', // width of Sidebar
            marginTop: '64px', // height of Navbar
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default Layout;
