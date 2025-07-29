import axios from 'axios';

// Base configuration
const PROJECT_ID = 'internship-2025-465209';
const DATABASE_ID = 'dawood'; // Make sure this database exists in your Firebase project
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

// Helper function to create headers
function createHeaders(authToken) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  return headers;
}

export async function addUser(userId, userData, authToken) {
  try {
    const url = `${BASE_URL}/user/${userId}`;
    const headers = createHeaders(authToken);
    
    const data = {
      fields: {
        createdAt: { timestampValue: userData.createdAt.toISOString() },
        Name: { stringValue: `${userData.firstName} ${userData.lastName}` },
        Role: { stringValue: 'user' },
        uID: { stringValue: userId },
      },
    };
    
    const response = await axios.patch(url, data, { headers });
    console.log('User added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding userdata:', error.response?.data || error.message);
    throw error;
  }
}

export async function addMail(mailData, authToken) {
  try {
    const url = `${BASE_URL}/mail`;
    const headers = createHeaders(authToken);
    
    const data = {
      fields: {
        to: { stringValue: mailData.to },
        subject: { stringValue: mailData.subject },
        message: {
          mapValue: {
            fields: {
              text: { stringValue: mailData.message.text },
              html: { stringValue: mailData.message.html },
            },
          },
        },
        createdAt: { timestampValue: mailData.createdAt.toISOString() },
        sent: { booleanValue: false }
      },
    };
    
    const response = await axios.post(url, data, { headers });
    console.log('Mail added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding mail data:', error.response?.data || error.message);
    throw error;
  }
}

export async function addTeacher(teacherData, authToken) {
  try {
    const url = `${BASE_URL}/Teacher`;
    const headers = createHeaders(authToken);
    
    const data = {
      fields: {
        name: { stringValue: teacherData.name },
        email: { stringValue: teacherData.email },
        password: { stringValue: teacherData.password },
        subject: { stringValue: teacherData.subject },
        gender: { stringValue: teacherData.gender },
        profilePicUrl: { stringValue: teacherData.profilePicUrl || '' },
        createdAt: { timestampValue: teacherData.createdAt.toISOString() },
        updatedAt: { timestampValue: teacherData.updatedAt.toISOString() }
      },
    };
    
    const response = await axios.post(url, data, { headers });
    console.log('Teacher added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding teacher data:', error.response?.data || error.message);
    throw error;
  }
}

export async function fetchUserFromDawood(userId, authToken) {
  try {
    const url = `${BASE_URL}/user/${userId}`;
    const headers = createHeaders(authToken);
    
    const response = await axios.get(url, { headers });
    const doc = response.data;
    
    if (!doc || !doc.fields) {
      return null;
    }
    
    // Map Firestore document fields to user object
    const user = {
      Name: doc.fields.Name?.stringValue || '',
      Role: doc.fields.Role?.stringValue || '',
      uID: doc.fields.uID?.stringValue || '',
      createdAt: doc.fields.createdAt?.timestampValue || '',
    };
    
    return user;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('User not found in dawood database');
      return null;
    }
    console.error('Error fetching user from dawood database:', error.response?.data || error.message);
    return null;
  }
}

// Test function to verify database connection
export async function testDatabaseConnection(authToken) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}`;
    const headers = createHeaders(authToken);
    
    const response = await axios.get(url, { headers });
    console.log('Database connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.response?.data || error.message);
    return false;
  }
}