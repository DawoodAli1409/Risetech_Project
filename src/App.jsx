import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Provider, useDispatch } from 'react-redux';
import store from './store';
import Register from './Pages/Register';
import VerifyEmail from './Pages/VerifyEmail';
import Login from './Pages/Login';
import Navbar from './components/Navbar';
import PasswordReset from './Pages/PasswordReset';
import PrivateRoute from './components/PrivateRoute';
import AdminPage from './Pages/AdminPage';
import UserPage from './Pages/UserPage';
import AdminTeachers from './Pages/AdminTeachers';
import AddProject from './Pages/AddProject';
import Layout from './components/Layout';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, clearUser } from './store/userSlice';
import { fetchUserFromDawood } from './firebaseDawood'; 

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function ErrorPage() {
  return <h1>404 Not Found - The page you are looking for does not exist.</h1>;
}

function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [redirected, setRedirected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const dawoodUser = await fetchUserFromDawood(firebaseUser.uid);
          const role = dawoodUser?.Role;
          dispatch(setUser({
            uid: firebaseUser.uid,
            name: dawoodUser?.Name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: role,
            isAuthenticated: true
          }));
          if (!redirected) {
            setRedirected(true);
            setIsLoading(false);
            if (role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/user');
            }
          } else {
            setIsLoading(false);
          }
        } else {
          dispatch(clearUser());
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch, redirected, navigate]);

  if (isLoading) {
    return null;
  }

  return children;
}

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/verify-email',
      element: <VerifyEmail />,
    },
    {
      path: '/password-reset',
      element: <PasswordReset />,
    },
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },
    {
      path: '/',
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: 'user',
          element: (
            <AuthInitializer>
              <PrivateRoute allowedRoles={['user', 'admin']}>
                <UserPage />
              </PrivateRoute>
            </AuthInitializer>
          ),
        },
        {
          path: 'project',
          element: (
            <AuthInitializer>
              <PrivateRoute allowedRoles={['user', 'admin']}>
                <AddProject />
              </PrivateRoute>
            </AuthInitializer>
          ),
        },
        {
          path: 'admin',
          element: (
            <AuthInitializer>
              <PrivateRoute allowedRoles={['admin']}>
                <AdminPage />
              </PrivateRoute>
            </AuthInitializer>
          ),
        },
        {
          path: 'admin/teachers',
          element: (
            <AuthInitializer>
              <PrivateRoute allowedRoles={['admin']}>
                <AdminTeachers />
              </PrivateRoute>
            </AuthInitializer>
          ),
        },
      ],
    },
    {
      path: '*',
      element: <ErrorPage />,
    },
  ],
  {
    basename: '/Risetech_Project',
  }
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
