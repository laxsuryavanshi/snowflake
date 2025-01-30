import { useAuthenticator } from '@aws-amplify/ui-react-core';
import { Navigate, useLocation } from 'react-router';

const ProtectedRoute = ({ element }: Readonly<{ element: React.ReactNode }>) => {
  const { authStatus } = useAuthenticator();
  const location = useLocation();

  switch (authStatus) {
    case 'configuring':
      return null;
    case 'authenticated':
      return element;
    default:
      return <Navigate to={`/auth/login?next=${location.pathname}`} replace />;
  }
};

export default ProtectedRoute;
