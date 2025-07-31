import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Grid, Card, CardContent, Fade, Slide } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AdminPage = () => {
  const navigate = useNavigate();

  const [totalProjects, setTotalProjects] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projects = projectsSnapshot.docs.map(doc => doc.data());
        setTotalProjects(projects.length);

        // Fetch teachers
        const teachersSnapshot = await getDocs(collection(db, 'Teacher'));
        setTotalTeachers(teachersSnapshot.size);

        // Calculate unique students from projects
        const studentEmailsSet = new Set();
        projects.forEach(project => {
          if (project.students && Array.isArray(project.students)) {
            project.students.forEach(student => {
              if (student.email) {
                studentEmailsSet.add(student.email.toLowerCase());
              }
            });
          }
        });
        setTotalStudents(studentEmailsSet.size);

        setLoaded(true);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleManageTeachersClick = () => {
    navigate('/admin/teachers');
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontFamily: "'Roboto Slab', serif",
          fontWeight: 'bold',
          animation: 'fallDown 1.2s ease forwards',
          opacity: 0,
          marginTop: '-20px',
          '@keyframes fallDown': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-50px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        Admin Dashboard
      </Typography>

      <Fade in={loaded} timeout={600}>
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
          <Slide direction="up" in={loaded} mountOnEnter unmountOnExit timeout={400}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                  color: 'white',
                  boxShadow: 6,
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.07)',
                    boxShadow: 20,
                  },
                }}
                elevation={6}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {totalProjects}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Slide>

          <Slide direction="up" in={loaded} mountOnEnter unmountOnExit timeout={600}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                  color: 'white',
                  boxShadow: 6,
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.07)',
                    boxShadow: 20,
                  },
                }}
                elevation={6}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Teachers
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {totalTeachers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Slide>

          <Slide direction="up" in={loaded} mountOnEnter unmountOnExit timeout={800}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  boxShadow: 6,
                  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.07)',
                    boxShadow: 20,
                  },
                }}
                elevation={6}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {totalStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Slide>
        </Grid>
      </Fade>

        <Slide
      direction="up"
      in={loaded}
      mountOnEnter
      unmountOnExit
      timeout={1200} // Total slide animation time
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleManageTeachersClick}
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          transition: 'all 0.7s ease 0.4s',
          '&:hover': {
            background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
            boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .5)',
            transform: 'scale(1.05)',
          },
        }}
      >
        Manage Teachers
      </Button>
    </Slide>
    </Box>
  );
};

export default AdminPage;
