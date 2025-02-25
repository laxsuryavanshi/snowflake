import { Suspense } from 'react';
import { Amplify } from 'aws-amplify';
import { AuthProvider } from '@snowflake/core-auth';

import { ThemeProvider } from './theme';
import Router from './Router';
import Loader from './components/Loader';

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
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<Loader />}>
          <Router />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
