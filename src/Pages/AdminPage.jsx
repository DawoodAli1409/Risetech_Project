import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();

  const handleManageTeachersClick = () => {
    navigate('/admin/teachers');
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Admin Page
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleManageTeachersClick}
      >
        Manage Teachers
      </Button>
    </Box>
  );
};

export default AdminPage;
