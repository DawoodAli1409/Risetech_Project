import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, Card, CardContent, CardMedia, Grid, Avatar, Stack, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { styled, keyframes } from '@mui/system';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  border: 0,
  borderRadius: '8px',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 8px 3px rgba(33, 203, 243, .4)',
    animation: `${gradientAnimation} 3s ease infinite`,
    backgroundSize: '200% 200%',
  },
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
  animation: `${fadeIn} 0.5s ease forwards`,
}));

const TiltCard = ({ children, style }) => {
  const cardRef = React.useRef(null);
  const [transformStyle, setTransformStyle] = React.useState({});

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;
    const centerX = rect.left + cardWidth / 2;
    const centerY = rect.top + cardHeight / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const rotateX = ((mouseY - centerY) / (cardHeight / 2)) * 10;
    const rotateY = ((centerX - mouseX) / (cardWidth / 2)) * 10;

    setTransformStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`,
      boxShadow: '0 0 15px 5px rgba(33, 150, 243, 0.7)',
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    });
  };

  return (
    <DashboardCard
      ref={cardRef}
      style={{ ...style, ...transformStyle, cursor: 'pointer' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </DashboardCard>
  );
};

const DashboardTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Roboto Condensed", sans-serif',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  position: 'relative',
  marginBottom: '2rem',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: 0,
    width: '60px',
    height: '4px',
    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
    borderRadius: '2px',
  },
}));

const UserPage = ({ sidebarOpen }) => {
  const [projects, setProjects] = useState([]);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const projectsData = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        let imageUrl = data.imageUrl || '';
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
    <Box sx={{ 
      p: isMobile ? (sidebarOpen ? '16px 16px 16px 124px' : '16px') : '24px 24px 24px 224px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'linear-gradient(to bottom, #f9fbfd, #ffffff)',
      minHeight: '100vh',
      transition: 'padding 0.3s ease',
      boxSizing: 'border-box',
      width: isMobile ? (sidebarOpen ? 'calc(100vw - 120px)' : '100vw') : 'calc(100vw - 200px)',
      overflowX: 'hidden'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 4
      }}>
        <DashboardTitle variant="h3" sx={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          maxWidth: isMobile ? (sidebarOpen ? 'calc(100vw - 180px)' : 'calc(100vw - 80px)') : '100%'
        }}>
          USER DASHBOARD
        </DashboardTitle>
        <GradientButton 
          variant="contained" 
          onClick={() => navigate('/project')}
          sx={{ 
            mb: { xs: 2, md: 0 },
            alignSelf: 'flex-start',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          ADD NEW PROJECT
        </GradientButton>
      </Box>

      {projects.length === 0 ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
          animation: `${fadeIn} 0.5s ease forwards`
        }}>
          <Typography variant="h6" color="textSecondary">
            No projects found. Create your first project!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} justifyContent="flex-start">
          {projects.map((project, index) => (
            <Grid item xs={12} sm={6} md={4} key={project.id} sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              paddingLeft: isMobile && sidebarOpen ? '12px' : '0'
            }}>
              <TiltCard style={{ 
                animationDelay: `${index * 0.1}s`, 
                width: isMobile ? (sidebarOpen ? '260px' : '100%') : '300px'
              }}>
                {project.imageUrl && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={project.imageUrl}
                    alt={project.title}
                    sx={{
                      objectFit: 'cover',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                    }}
                  />
                )}
                <CardContent sx={{ p: 3 }}>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: '#2d3748',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {project.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                      minHeight: '60px'
                    }}
                  >
                    {project.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: '#4a5568',
                        display: 'flex',
                        alignItems: 'center',
                        '&:before': {
                          content: '""',
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '2px',
                          background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                          marginRight: '8px'
                        }
                      }}
                    >
                      Students
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                      {project.students && project.students.map((student, studentIndex) => (
                        <Box
                          key={studentIndex}
                          sx={{
                            position: 'relative',
                            display: 'inline-block',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={() => setHoveredStudent(`${project.id}-${studentIndex}`)}
                          onMouseLeave={() => setHoveredStudent(null)}
                        >
                          <Avatar 
                            alt={student.name} 
                            sx={{
                              width: 36,
                              height: 36,
                              border: '2px solid #e2e8f0',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                borderColor: '#2196F3'
                              }
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: '110%',
                              left: studentIndex === 0 ? '0' : '50%',
                              transform: hoveredStudent === `${project.id}-${studentIndex}`
                                ? studentIndex === 0 
                                  ? 'translateY(0)' 
                                  : 'translateX(-50%) translateY(0)'
                                : studentIndex === 0
                                  ? 'translateY(10px)'
                                  : 'translateX(-50%) translateY(10px)',
                              bgcolor: 'background.paper',
                              color: 'text.primary',
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                              borderRadius: '8px',
                              p: 1.5,
                              minWidth: 180,
                              maxWidth: 200,
                              opacity: hoveredStudent === `${project.id}-${studentIndex}` ? 1 : 0,
                              pointerEvents: hoveredStudent === `${project.id}-${studentIndex}` ? 'auto' : 'none',
                              transition: 'opacity 0.3s ease, transform 0.3s ease',
                              zIndex: 10,
                              whiteSpace: 'normal',
                              textAlign: 'center',
                              '&:after': {
                                content: '""',
                                position: 'absolute',
                                top: '100%',
                                left: studentIndex === 0 ? '20px' : '50%',
                                transform: studentIndex === 0 ? 'none' : 'translateX(-50%)',
                                borderWidth: '8px',
                                borderStyle: 'solid',
                                borderColor: '#fff transparent transparent transparent',
                              }
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                              {student.name}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              wordBreak: 'break-word', 
                              color: '#718096',
                              overflowWrap: 'break-word'
                            }}>
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: '#4a5568',
                        display: 'flex',
                        alignItems: 'center',
                        '&:before': {
                          content: '""',
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '2px',
                          background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                          marginRight: '8px'
                        }
                      }}
                    >
                      Sustainability Details
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '60px'
                      }}
                    >
                      {project.sustainability}
                    </Typography>
                  </Box>
                </CardContent>
              </TiltCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default UserPage;