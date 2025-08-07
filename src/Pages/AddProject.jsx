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
      students: [{ name: '', email: '' }],
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
    try {
      let imageUrl = '';
      if (data.imageFile && data.imageFile.length > 0) {
        const file = data.imageFile[0];
        const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const currentUser = auth.currentUser;
      const projectData = {
        title: data.title,
        description: data.description,
        students: data.students,
        supervisorId: data.supervisorId?.id || '',
        coSupervisorId: data.coSupervisorId?.id || '',
        sustainability: data.sustainability,
        imageUrl,
        createdBy: currentUser ? currentUser.uid : '',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'projects'), projectData);
      navigate('/user');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const students = watch('students');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Add New Project</Typography>
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
                  rows={3}
                  margin="normal"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Students (up to 4)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {fields.map((item, index) => (
              <Grid container spacing={2} key={item.id} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={5}>
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
                <Grid item xs={5}>
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
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
            {fields.length < 4 && (
              <Button variant="outlined" onClick={() => append({ name: '', email: '' })}>
                Add Student
              </Button>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
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
                      helperText={errors.supervisorId ? 'Supervisor is required' : ''}
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

        <Accordion>
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

        <Accordion>
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
                  }}
                >
                  <input {...getInputProps()} />
                  {field.value && field.value.length > 0 ? (
                    <img
                      src={URL.createObjectURL(field.value[0])}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 200, marginTop: 10 }}
                    />
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
            <Typography color="error" variant="body2">
              {errors.imageFile.message}
            </Typography>
          )}
        </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => navigate('/user')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddProject;