import { lazy } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Amplify } from 'aws-amplify';
import { AuthProvider } from '@snowflake/core-auth';

import { Layout, ProtectedRoute } from './components';
import store from './store';
import { ThemeProvider } from './theme';

const IndexPage = lazy(() => import('./pages/IndexPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const ForceNewPassword = lazy(() => import('./pages/auth/ForceNewPassword'));
const AppIndexPage = lazy(() => import('./pages/app/IndexPage'));

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID as string,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID as string,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID as string,
    },
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET_NAME as string,
      region: import.meta.env.VITE_S3_BUCKET_REGION as string,
    },
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<IndexPage />} />

              <Route path="app" element={<ProtectedRoute element={<Layout />} />}>
                <Route index element={<AppIndexPage />} />
              </Route>

              <Route path="auth">
                <Route index element={<Navigate to="login" replace />} />
                <Route path="login" element={<Login />} />
                <Route path="new-password" element={<ForceNewPassword />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
