import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { text: 'LOGIN', path: '/login' },
  { text: 'REGISTER', path: '/register' },
  { text: 'VERIFY EMAIL', path: '/verify-email' },
  { text: 'FORGOT PASSWORD', path: '/password-reset' },
];

const AuthHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleNavigate = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  return (
    <Box
      sx={{
        width: '100%',
        background: 'linear-gradient(90deg, #007CF0, #00DFD8)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        position: 'sticky',
        top: 0,
        zIndex: 1300,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ mr: 1, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 'bold',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            maxWidth: { xs: '60vw', sm: 'auto' },
          }}
        >
          Project Management App
        </Typography>
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, flexWrap: 'wrap' }}>
        {menuItems.map(({ text, path }) => (
          <Button
            key={text}
            color="inherit"
            onClick={() => navigate(path)}
            sx={{ fontWeight: 'bold' }}
          >
            {text}
          </Button>
        ))}
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {menuItems.map(({ text, path }) => (
              <ListItemButton key={text} onClick={() => handleNavigate(path)}>
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default AuthHeader;
