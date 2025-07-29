// src/Pages/UserPage.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
import Navbar from '../components/Navbar';

const UserPage = () => {
  return (
    <>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">User Dashboard</Typography>
        <Typography>Welcome to your dashboard!</Typography>
      </Box>
    </>
  );
};

export default UserPage;