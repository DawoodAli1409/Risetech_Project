// src/components/Sidebar.jsx
import React from 'react';
import { Box, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const adminMenuItems = [
    { text: 'Dashboard', path: '/admin' },
    { text: 'Manage Teachers', path: '/admin/teachers' },
  ];

  const userMenuItems = [
    { text: 'Home', path: '/user' },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        background: 'linear-gradient(180deg, #007CF0 0%, #00DFD8 100%)', // gradient background matching navbar
        borderRight: 1,
        borderColor: 'divider',
        position: 'fixed',
        top: 64, // height of Navbar AppBar
        left: 0,
        overflowY: 'auto',
        fontFamily: "'Poppins', sans-serif",
        color: 'white',
        paddingTop: 2,
        paddingBottom: 2,
      }}
    >
      <List>
        {menuItems.map(({ text, path }) => (
          <ListItemButton
            key={text}
            selected={location.pathname === path}
            onClick={() => navigate(path)}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              color: 'white',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: 'white',
              },
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: 0,
                background: 'linear-gradient(to right, #4dd219, #193ed2)', // green to blue gradient
                transition: 'width 0.5s ease',
                zIndex: -1,
              },
              '&:hover:before': {
                width: '100%',
              },
            }}
          >
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
    </Box>
  );
};

export default Sidebar;
