import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Switch, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress, Fab, FormControlLabel, RadioGroup, Radio, FormLabel } from '@mui/material';
import { styled } from '@mui/system';
import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSpring, animated } from 'react-spring';

const storage = getStorage();

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
    animation: `gradientAnimation 3s ease infinite`,
    backgroundSize: '200% 200%',
  },
}));

const AdminTeachers = () => {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <DashboardTitle variant="h4">
          Teacher Management
        </DashboardTitle>
        <GradientButton variant="contained" onClick={() => openDialog()}>
          Add Teacher
        </GradientButton>
      </Box>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fetching ? (
          <div className="col-span-full flex justify-center items-center space-x-2">
            <CircularProgress size={24} />
            <Typography>Loading teachers...</Typography>
          </div>
        ) : teachers.length === 0 ? (
          <Typography className="col-span-full text-center text-gray-600">
            No teachers found. Add your first teacher using the button below.
          </Typography>
        ) : (
          teachers.map(teacher => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={openDialog}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>


      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
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
            <input
              type="file"
              accept="image/*"
              {...register('profilePic')}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setProfilePicPreview(URL.createObjectURL(e.target.files[0]));
                  clearErrors('profilePic');
                }
              }}
              disabled={loading}
              style={{ marginTop: 16, marginBottom: 16 }}
            />
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
    </div>
  );
};

export default AdminTeachers;