import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, Card, CardContent, CardMedia, Grid, Avatar, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';

const UserPage = () => {
  const [projects, setProjects] = useState([]);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const projectsData = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        let imageUrl = data.imageUrl || '';
        // If imageUrl is a storage path, get the download URL
        if (imageUrl && !imageUrl.startsWith('http')) {
          try {
            const imageRef = ref(storage, imageUrl);
            imageUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.error('Error getting image download URL:', error);
            imageUrl = '';
          }
        }
        projectsData.push({ id: doc.id, ...data, imageUrl });
      }
      setProjects(projectsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>User Dashboard</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/project')} sx={{ mb: 3 }}>
        Add New Project
      </Button>
      {projects.length === 0 ? (
        <Typography>No projects found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card>
                {project.imageUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={project.imageUrl}
                    alt={project.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {project.description}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Students:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {project.students && project.students.map((student, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          display: 'inline-block',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={() => setHoveredStudent(`${project.id}-${index}`)}
                        onMouseLeave={() => setHoveredStudent(null)}
                      >
                        <Avatar alt={student.name} />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: '110%',
                            left: '50%',
                            transform: hoveredStudent === `${project.id}-${index}`
                              ? 'translateX(-50%) translateY(0)'
                              : 'translateX(-50%) translateY(10px)',
                            bgcolor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 3,
                            borderRadius: 1,
                            p: 1,
                            minWidth: 180,
                            opacity: hoveredStudent === `${project.id}-${index}` ? 1 : 0,
                            pointerEvents: hoveredStudent === `${project.id}-${index}` ? 'auto' : 'none',
                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                            zIndex: 10,
                            whiteSpace: 'normal',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {student.name}
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {student.email}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                  <Typography variant="subtitle2" gutterBottom>
                    Sustainability Details:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {project.sustainability}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default UserPage;
