import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Switch, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress, Fab, FormControlLabel, RadioGroup, Radio, FormLabel, useMediaQuery } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSpring, animated } from 'react-spring';
import { useDropzone } from 'react-dropzone';

const storage = getStorage();

// Animation keyframes
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const TeacherCard = ({ teacher, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const animationProps = useSpring({
    transform: hovered ? 'scale(1.05)' : 'scale(1)',
    boxShadow: hovered
      ? '0 10px 20px rgba(33, 150, 243, 0.4)'
      : '0 4px 10px rgba(0,0,0,0.1)',
    border: hovered ? '2px solid #2196F3' : '2px solid transparent',
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.div
      style={{ ...animationProps }}
      className="bg-white rounded-lg p-4 flex flex-col shadow-md cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={teacher.profilePicUrl}
          alt={teacher.name}
          className="max-w-[80px] max-h-[80px] rounded-full object-cover"
          style={{ width: 'auto', height: 'auto', maxWidth: '80px', maxHeight: '80px' }}
        />
        <div>
          <Typography variant="h6" className="font-semibold">{teacher.name}</Typography>
          <Typography variant="body2" className="text-gray-600">{teacher.subject}</Typography>
          <Typography variant="body2" className="text-gray-500 capitalize">{teacher.gender}</Typography>
        </div>
      </div>
      <div className="flex justify-between mt-auto">
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(teacher)}
          className="transition-transform duration-150 active:scale-95"
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(teacher.id)}
          className="transition-transform duration-150 active:scale-95"
        >
          Delete
        </Button>
      </div>
    </animated.div>
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
  [theme.breakpoints.down('sm')]: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    padding: '0',
    minWidth: '0',
    '& .MuiButton-startIcon': {
      margin: '0',
    }
  }
}));

const AdminTeachers = ({ sidebarOpen }) => {
  const { register, handleSubmit, reset, control, setValue, formState: { errors }, clearErrors } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      gender: 'male',
    },
  });

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setFetching(true);
    try {
      const teacherCollection = collection(db, 'Teacher');
      const snapshot = await getDocs(teacherCollection);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setFetching(false);
    }
  };

  const openDialog = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setValue('name', teacher.name);
      setValue('email', teacher.email);
      setValue('password', teacher.password);
      setValue('subject', teacher.subject);
      setValue('gender', teacher.gender);
      setProfilePicPreview(teacher.profilePicUrl);
    } else {
      setEditingTeacher(null);
      reset();
      setProfilePicPreview('');
    }
    clearErrors();
    setDialogOpen(true);
  };

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setValue('profilePic', acceptedFiles, { shouldValidate: true });
      setProfilePicPreview(URL.createObjectURL(acceptedFiles[0]));
      clearErrors('profilePic');
    }
  }, [setValue, clearErrors]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: loading,
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTeacher(null);
    reset();
    setProfilePicPreview('');
    clearErrors();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let profilePicUrl = profilePicPreview || '';

      if (data.profilePic?.[0]) {
        const file = data.profilePic[0];
        const storageRef = ref(storage, `Teachers/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        profilePicUrl = await getDownloadURL(snapshot.ref);
      }

      const teacherData = {
        name: data.name,
        email: data.email,
        password: data.password,
        subject: data.subject,
        gender: data.gender,
        profilePicUrl,
        updatedAt: new Date(),
        createdAt: editingTeacher ? editingTeacher.createdAt : new Date(),
      };

      const teacherCollection = collection(db, 'Teacher');

      if (editingTeacher) {
        const docRef = doc(db, 'Teacher', editingTeacher.id);
        await updateDoc(docRef, teacherData);
        setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { id: editingTeacher.id, ...teacherData } : t));
      } else {
        const docRef = await addDoc(teacherCollection, teacherData);
        setTeachers(prev => [...prev, { id: docRef.id, ...teacherData }]);
      }

      closeDialog();
    } catch (error) {
      console.error('Error saving teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'Teacher', id));
      setTeachers(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <DashboardTitle variant="h4" sx={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          maxWidth: isMobile ? (sidebarOpen ? 'calc(100vw - 180px)' : 'calc(100vw - 80px)') : '100%'
        }}>
          TEACHER MANAGEMENT
        </DashboardTitle>
        {!isMobile && (
          <GradientButton variant="contained" onClick={() => openDialog()}>
            ADD TEACHER
          </GradientButton>
        )}
      </Box>

      {isMobile && (
        <GradientButton 
          variant="contained" 
          onClick={() => openDialog()}
          startIcon={<AddIcon />}
          sx={{
            '& .MuiButton-label': {
              display: 'none'
            }
          }}
        />
      )}

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 3,
        width: '100%'
      }}>
        {fetching ? (
          <Box sx={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Loading teachers...</Typography>
          </Box>
        ) : teachers.length === 0 ? (
          <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', color: 'text.secondary' }}>
            No teachers found. Add your first teacher using the button above.
          </Typography>
        ) : (
          teachers.map(teacher => (
            <Box key={teacher.id} sx={{ 
              display: 'flex',
              justifyContent: 'center',
              paddingLeft: isMobile && sidebarOpen ? '12px' : '0'
            }}>
              <TeacherCard
                teacher={teacher}
                onEdit={openDialog}
                onDelete={handleDelete}
              />
            </Box>
          ))
        )}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            width: '75vw',
            maxWidth: '75vw',
          }
        }}
      >
        <DialogTitle>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
        <DialogContent>
          <form id="teacher-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6" style={{ padding: '16px' }}>
            <TextField
              label="Name"
              fullWidth
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
              margin="normal"
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
              margin="normal"
            />
            <TextField
              label="Subject"
              fullWidth
              {...register('subject', { required: 'Subject is required' })}
              error={!!errors.subject}
              helperText={errors.subject?.message}
              disabled={loading}
              margin="normal"
            />
            <FormLabel sx={{ mt: 2, mb: 1 }}>Gender</FormLabel>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Gender is required' }}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel value="male" control={<Radio />} label="Male" disabled={loading} />
                  <FormControlLabel value="female" control={<Radio />} label="Female" disabled={loading} />
                </RadioGroup>
              )}
            />
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #2196F3',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: isDragActive ? '#1976d2' : 'inherit',
                mb: 2,
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Typography>Drop the image here ...</Typography>
              ) : (
                <Typography>Drag 'n' drop an image here, or click to select one</Typography>
              )}
            </Box>
            {profilePicPreview && (
              <img
                src={profilePicPreview}
                alt="Preview"
                className="mt-2 rounded"
                style={{ maxWidth: '150px', maxHeight: '150px', width: 'auto', height: 'auto' }}
              />
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={loading}>Cancel</Button>
          <Button form="teacher-form" type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editingTeacher ? 'Update Teacher' : 'Add Teacher'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTeachers;