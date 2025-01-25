import React from 'react';
import { AuthenticatorProvider, useAuthenticatorInitMachine } from '@aws-amplify/ui-react-core';

const AuthProviderInternal: React.FC<React.PropsWithChildren> = ({ children }) => {
  useAuthenticatorInitMachine({
    initialState: 'signIn',
    loginMechanism: 'email',
  });

  return children;
};

const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <AuthenticatorProvider>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </AuthenticatorProvider>
  );
};

export default AuthProvider;
