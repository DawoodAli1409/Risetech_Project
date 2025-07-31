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
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        position: 'fixed',
        top: 64, // height of Navbar AppBar
        left: 0,
        overflowY: 'auto',
      }}
    >
      <List>
        {menuItems.map(({ text, path }) => (
          <ListItemButton
            key={text}
            selected={location.pathname === path}
            onClick={() => navigate(path)}
          >
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
    </Box>
  );
};

export default Sidebar;