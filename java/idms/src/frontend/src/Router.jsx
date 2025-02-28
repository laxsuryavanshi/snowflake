import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';

const Login = lazy(() => import('./pages/Login'));

const Router = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />
      <Route path="login" element={<Login />} />
    </Routes>
  );
};

export default Router;
