import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
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
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, clearUser } from './store/userSlice';
import { fetchUserFromDawood } from './firebaseDawood'; // ✅ Required import

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
              navigate('/');
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
      path: '/',
      element: (
        <AuthInitializer>
          <PrivateRoute allowedRoles={['user', 'admin']}>
            <UserPage />
          </PrivateRoute>
        </AuthInitializer>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: '/login',
      element: (
        <>
          <Navbar />
          <Login />
        </>
      ),
    },
    {
      path: '/register',
      element: (
        <>
          <Navbar />
          <Register />
        </>
      ),
    },
    {
      path: '/verify-email',
      element: (
        <>
          <Navbar />
          <VerifyEmail />
        </>
      ),
    },
    {
      path: '/password-reset',
      element: (
        <>
          <Navbar />
          <PasswordReset />
        </>
      ),
    },
    {
      path: '/admin',
      element: (
        <PrivateRoute allowedRoles={['admin']}>
          <AdminPage />
        </PrivateRoute>
      ),
    },
    {
      path: '*',
      element: <ErrorPage />,
    },
  ],
  {
    basename: '/risetech-project',
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
