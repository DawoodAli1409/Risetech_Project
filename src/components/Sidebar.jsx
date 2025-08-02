import React from 'react';
import { Box, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ role, open, onClose }) => {
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

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Box
      sx={{
        width: { xs: 120, sm: 200 }, // Increased width on xs for partial expansion
        height: 'calc(100vh - 56px)',
        background: 'linear-gradient(180deg, #007CF0 0%, #00DFD8 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        position: 'fixed',
        top: 56,
        left: 0,
        overflowY: 'auto',
        fontFamily: "'Poppins', sans-serif",
        color: 'white',
        padding: '8px 0',
        display: { xs: open ? 'block' : 'none', sm: 'block' },
        zIndex: 1200,
        transition: 'transform 0.3s ease',
        transform: { 
          xs: open ? 'translateX(0)' : 'translateX(-100%)',
          sm: 'translateX(0)' 
        },
      }}
    >
      <List dense sx={{ padding: 0 }}>
        {menuItems.map(({ text, path }) => (
          <ListItemButton
            key={text}
            onClick={() => handleNavigation(path)}
            sx={{
              minHeight: 40,
              padding: '8px 12px', // Adjusted padding for narrower width
              color: 'inherit',
              '&:hover': {
                background: 'linear-gradient(270deg, #66FF66, #004080)',  // Lighter green to blue gradient
                backgroundSize: '200% 100%',
                animation: 'moveGradient 3s linear infinite',
                color: 'white',
              },
              '@keyframes moveGradient': {
                '0%': {
                  backgroundPosition: '200% 0',
                },
                '100%': {
                  backgroundPosition: '-200% 0',
                },
              },
            }}
          >
            <ListItemText 
              primary={text} 
              primaryTypographyProps={{
                fontSize: '0.8rem', // Slightly smaller font
                fontWeight: 500,
                noWrap: true, // Prevent text wrapping
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;