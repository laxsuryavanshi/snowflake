import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Amplify } from 'aws-amplify';
import { AuthProvider } from '@snowflake/core-auth';

import { Layout, ProtectedRoute } from './components';
import { ThemeProvider } from './theme';

const IndexPage = lazy(() => import('./pages/IndexPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const ForceNewPassword = lazy(() => import('./pages/auth/ForceNewPassword'));

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID as string,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID as string,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID as string,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IndexPage />} />

            <Route path="app" element={<ProtectedRoute element={<Layout />} />} />

            <Route path="auth">
              <Route index element={<Navigate to="login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="new-password" element={<ForceNewPassword />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
