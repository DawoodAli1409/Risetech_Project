import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Autocomplete,
  Avatar,
  Stack,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

const AddProject = () => {
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      students: [{ name: '', email: '', profilePicture: null }],
      supervisorId: null,
      coSupervisorId: null,
      sustainability: '',
      imageFile: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'students',
  });

  const [teachers, setTeachers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersCol = collection(db, 'Teacher');
        const teacherSnapshot = await getDocs(teachersCol);
        const teacherList = teacherSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeachers(teacherList);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, []);

  const onSubmit = async (data) => {
    setIsUploading(true);
    try {
      let imageUrl = '';
      let imagePath = '';
      
      // Upload project image if exists
      if (data.imageFile && data.imageFile.length > 0) {
        const file = data.imageFile[0];
        imagePath = `projects/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, imagePath);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Upload student profile pictures
      const studentsWithPictures = await Promise.all(
        data.students.map(async (student) => {
          let avatarUrl = '';
          let avatarPath = '';
          
          if (student.profilePicture && student.profilePicture.length > 0) {
            const file = student.profilePicture[0];
            avatarPath = `students/${Date.now()}_${student.name}_${file.name}`;
            const storageRef = ref(storage, avatarPath);
            const snapshot = await uploadBytes(storageRef, file);
            avatarUrl = await getDownloadURL(snapshot.ref);
          }
          
          return {
            name: student.name,
            email: student.email,
            avatarUrl,
            avatarPath
          };
        })
      );

      const currentUser = auth.currentUser;
      
      // Create single project document with all data
      const projectData = {
        title: data.title,
        description: data.description,
        students: studentsWithPictures,
        supervisorId: data.supervisorId?.id || '',
        coSupervisorId: data.coSupervisorId?.id || '',
        sustainability: data.sustainability,
        imageUrl,
        imagePath,
        createdBy: currentUser ? currentUser.uid : '',
        createdAt: serverTimestamp(),
      };

      // Add only one document to projects collection
      await addDoc(collection(db, 'projects'), projectData);
      navigate('/user');
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const students = watch('students');

  return (
    <Box sx={{ p: 3, maxWidth: { xs: '100%', md: '800px' }, margin: { xs: 0, md: 'auto' } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Add New Project</Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Project Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Project Title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Title"
                  fullWidth
                  margin="normal"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Students (up to 4)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {fields.map((item, index) => (
              <Paper key={item.id} elevation={2} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Student {index + 1}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`students.${index}.name`}
                      control={control}
                      rules={{ required: 'Name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Name"
                          fullWidth
                          error={!!errors.students?.[index]?.name}
                          helperText={errors.students?.[index]?.name?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`students.${index}.email`}
                      control={control}
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email"
                          fullWidth
                          error={!!errors.students?.[index]?.email}
                          helperText={errors.students?.[index]?.email?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Profile Picture
                    </Typography>
                    <Controller
                      name={`students.${index}.profilePicture`}
                      control={control}
                      render={({ field }) => {
                        const onDrop = (acceptedFiles) => {
                          field.onChange(acceptedFiles);
                        };

                        const { getRootProps, getInputProps, isDragActive } = useDropzone({
                          onDrop,
                          accept: { 'image/*': [] },
                          multiple: false,
                        });

                        return (
                          <div
                            {...getRootProps()}
                            style={{
                              border: '2px dashed #1976d2',
                              padding: '15px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              backgroundColor: isDragActive ? '#e3f2fd' : '#f5f5f5',
                              borderRadius: '8px',
                              minHeight: '80px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <input {...getInputProps()} />
                            {field.value && field.value.length > 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={URL.createObjectURL(field.value[0])}
                                  sx={{ width: 60, height: 60 }}
                                />
                                <Typography variant="body2">
                                  {field.value[0].name}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2">
                                {isDragActive
                                  ? 'Drop the image here ...'
                                  : 'Drag & drop student picture here, or click to select'}
                              </Typography>
                            )}
                          </div>
                        );
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      Remove Student
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            {fields.length < 4 && (
              <Button 
                variant="outlined" 
                onClick={() => append({ name: '', email: '', profilePicture: null })}
                sx={{ mt: 2 }}
              >
                Add Student
              </Button>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Supervisor & Co-Supervisor</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Controller
              name="supervisorId"
              control={control}
              rules={{ required: 'Supervisor is required' }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={teachers}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, data) => field.onChange(data)}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supervisor"
                      margin="normal"
                      error={!!errors.supervisorId}
                      helperText={errors.supervisorId?.message}
                    />
                  )}
                />
              )}
            />
            <Controller
              name="coSupervisorId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={teachers}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, data) => field.onChange(data)}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Co-Supervisor"
                      margin="normal"
                    />
                  )}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Sustainability Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Controller
              name="sustainability"
              control={control}
              rules={{ required: 'Sustainability details are required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sustainability Details"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  error={!!errors.sustainability}
                  helperText={errors.sustainability?.message}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Project Image</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Controller
              name="imageFile"
              control={control}
              rules={{ required: 'Project image is required' }}
              render={({ field }) => {
                const onDrop = (acceptedFiles) => {
                  field.onChange(acceptedFiles);
                };

                const { getRootProps, getInputProps, isDragActive } = useDropzone({
                  onDrop,
                  accept: { 'image/*': [] },
                  multiple: false,
                });

                return (
                  <div
                    {...getRootProps()}
                    style={{
                      border: '2px dashed #1976d2',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isDragActive ? '#e3f2fd' : 'transparent',
                      borderRadius: '8px',
                    }}
                  >
                    <input {...getInputProps()} />
                    {field.value && field.value.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <img
                          src={URL.createObjectURL(field.value[0])}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: 200, borderRadius: '4px' }}
                        />
                      </Box>
                    ) : (
                      <Typography>
                        {isDragActive
                          ? 'Drop the image here ...'
                          : 'Drag & drop an image here, or click to select one'}
                      </Typography>
                    )}
                  </div>
                );
              }}
            />
            {errors.imageFile && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {errors.imageFile.message}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/user')}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? 'Creating Project...' : 'Create Project'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddProject;