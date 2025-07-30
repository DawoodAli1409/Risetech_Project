import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Button, TextField, Radio, RadioGroup, FormControlLabel, FormLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogActions, Typography,
  Alert, Snackbar, CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { db, auth } from '../firebase';
import { addTeacher, addMail } from '../firebaseDawood';
import Navbar from '../components/Navbar';

const storage = getStorage();

const AdminTeachers = () => {
  const { register, handleSubmit, reset, setValue, control, formState: { errors }, clearErrors, setError } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      gender: ''
    }
  });

  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [fetchingTeachers, setFetchingTeachers] = useState(false);

  const role = useSelector(state => state.user.role);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!role) {
        return;
      }

      setFetchingTeachers(true);

      try {
        const teacherCollection = collection(db, 'Teacher');
        const snapshot = await getDocs(teacherCollection);

        if (snapshot.empty) {
          setTeachers([]);
          showNotification('No teachers found in database', 'info');
          return;
        }

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeachers(data);
        showNotification(`Loaded ${data.length} teachers`, 'success');

      } catch (error) {
        showNotification(`Error fetching teachers: ${error.message}`, 'error');
      } finally {
        setFetchingTeachers(false);
      }
    };

    fetchTeachers();
  }, [role]);

  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated. Please log in again.');
      }

      if (!editingId && (!data.profilePic || data.profilePic.length === 0)) {
        setError('profilePic', {
          type: 'manual',
          message: 'Profile picture is required'
        });
        setLoading(false);
        return;
      }

      let profilePicUrl = data.profilePicUrl || '';

      if (data.profilePic?.[0]) {
        const file = data.profilePic[0];
        const storageRef = ref(storage, `Teachers/${Date.now()}_${file.name}`);

        const snapshot = await uploadBytes(storageRef, file);
        profilePicUrl = await getDownloadURL(snapshot.ref);
      }

      const now = new Date();
      const teacherData = {
        name: data.name,
        email: data.email,
        password: data.password,
        subject: data.subject,
        gender: data.gender,
        profilePicUrl,
        updatedAt: now,
        createdAt: editingId ? data.createdAt || now : now,
      };

      const teacherCollection = collection(db, 'Teacher');

      if (editingId) {
        const docRef = doc(db, 'Teacher', editingId);
        await updateDoc(docRef, teacherData);
        setTeachers(prev => prev.map(t => t.id === editingId ? { id: editingId, ...teacherData } : t));
        showNotification('Teacher updated successfully');
      } else {
        const docRef = await addDoc(teacherCollection, teacherData);
        const newTeacher = { id: docRef.id, ...teacherData };
        setTeachers(prev => [...prev, newTeacher]);
        showNotification('Teacher added successfully');
      }

      try {
        const authToken = await auth.currentUser.getIdToken();
        await addTeacher(teacherData, authToken);
      } catch (dawoodError) {
        // Non-critical error
      }

      try {
        const mailData = {
          to: data.email,
          subject: 'Welcome to the Teaching Team',
          message: {
            text: `Hello ${data.name},\n\nWelcome to the teaching team! Your subject is ${data.subject}.`,
            html: `<p>Hello <strong>${data.name}</strong>,</p><p>Welcome to the teaching team! Your subject is <strong>${data.subject}</strong>.</p>`
          },
          createdAt: now
        };

        const authToken = await auth.currentUser.getIdToken();
        await addMail(mailData, authToken);
      } catch (mailError) {
        // Non-critical error
      }

      reset();
      setProfilePicPreview('');
      setEditingId(null);
      clearErrors();

    } catch (error) {
      if (error.code === 'auth/id-token-expired' || error.message.includes('auth/id-token-expired')) {
        showNotification('Session expired. Please log in again.', 'error');
      } else if (error.code === 'permission-denied') {
        showNotification('Permission denied. Check your Firestore security rules.', 'error');
      } else {
        showNotification(error.message || 'Error saving teacher', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher.id);
    setValue('name', teacher.name);
    setValue('email', teacher.email);
    setValue('password', teacher.password);
    setValue('subject', teacher.subject);
    setValue('gender', teacher.gender);
    setValue('profilePicUrl', teacher.profilePicUrl);
    setValue('createdAt', teacher.createdAt);
    setProfilePicPreview(teacher.profilePicUrl);
    clearErrors();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
    setProfilePicPreview('');
    clearErrors();
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await deleteDoc(doc(db, 'Teacher', deleteDialog.id));
      setTeachers(prev => prev.filter(t => t.id !== deleteDialog.id));
      showNotification('Teacher deleted successfully');
    } catch (error) {
      showNotification(error.message || 'Error deleting teacher', 'error');
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Teacher Management
        </Typography>

        <Box className="admin-container" sx={{ mt: 4 }}>
          <Box className="admin-form" component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3, boxShadow: 3, borderRadius: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Subject"
              margin="normal"
              {...register('subject', { required: 'Subject is required' })}
              error={!!errors.subject}
              helperText={errors.subject?.message}
              disabled={loading}
            />

            <FormLabel sx={{ mt: 2, display: 'block' }}>Gender</FormLabel>
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
            {errors.gender && (
              <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                {errors.gender.message}
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <FormLabel>Profile Picture</FormLabel>
              <input
                type="file"
                accept="image/*"
                {...register('profilePic', !editingId ? { required: 'Profile picture is required' } : {})}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setProfilePicPreview(URL.createObjectURL(e.target.files[0]));
                    clearErrors('profilePic');
                  }
                }}
                style={{ display: 'block', marginTop: 8 }}
                disabled={loading}
              />
              {profilePicPreview && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={profilePicPreview}
                    alt="Preview"
                    style={{ maxWidth: '200px', borderRadius: '4px' }}
                  />
                </Box>
              )}
              {errors.profilePic && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.profilePic.message}
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Processing...' : editingId ? 'Update Teacher' : 'Add Teacher'}
              </Button>
              {editingId && (
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>

          <TableContainer className="admin-table" component={Paper} sx={{}}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Profile</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fetchingTeachers ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>Loading teachers...</Typography>
                    </TableCell>
                  </TableRow>
                ) : teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No teachers found. Add your first teacher using the form.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell style={{ textTransform: 'capitalize' }}>{teacher.gender}</TableCell>
                      <TableCell>
                        {teacher.profilePicUrl && (
                          <img
                            src={teacher.profilePicUrl}
                            alt="Profile"
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(teacher)} disabled={loading}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeleteDialog({ open: true, id: teacher.id })}
                          color="error"
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, id: null })}
        >
          <DialogTitle>Are you sure you want to delete this teacher?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default AdminTeachers;
