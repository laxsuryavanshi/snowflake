import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { ProtectedRoute } from './components';

const IndexPage = lazy(() => import('./pages'));
const Login = lazy(() => import('./pages/auth/Login'));
const ForceNewPassword = lazy(() => import('./pages/auth/ForceNewPassword'));
const AppDashboard = lazy(() => import('./pages/app'));
const Files = lazy(() => import('./pages/app/Files'));
const Recent = lazy(() => import('./pages/app/Recent'));
const Starred = lazy(() => import('./pages/app/Starred'));
const Shared = lazy(() => import('./pages/app/Shared'));
const Trash = lazy(() => import('./pages/app/Trash'));
const View = lazy(() => import('./pages/app/View'));

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />

        <Route path="app" element={<ProtectedRoute element={<AppDashboard />} />}>
          <Route index element={<Files />} />
          <Route path="recent" element={<Recent />} />
          <Route path="starred" element={<Starred />} />
          <Route path="shared" element={<Shared />} />
          <Route path="trash" element={<Trash />} />
          <Route path="view" element={<View />} />
        </Route>

        <Route path="auth">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="new-password" element={<ForceNewPassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
