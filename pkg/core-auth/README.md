# @snowflake/core-auth

## Overview

`@snowflake/core-auth` is designed to handle authentication functionality across applications. While it currently relies heavily on AWS Cognito for authentication and utilizes libraries like `aws-amplify` and `@aws-amplify/ui-react-core` for configuration and components, the goal is to remove this dependency and offer a flexible, provider-agnostic authentication helper.

## Features

- **Authentication Provider Support**: Currently supports AWS Cognito but aims to extend support for custom authentication providers.
- **React Integration**: Includes tools to simplify authentication flows in React applications.
- **Configuration Management**: Provides utilities to streamline the setup of authentication.

## Usage

### Installation

```sh
yarn add --dev @snowflake/core-auth
```

### Setting Up the Authentication Provider

#### With AWS Cognito

Configure authentication provider by importing necessary utilities:

```tsx
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: '<CognitoUserPoolId>',
      userPoolClientId: '<CognitoUserPoolClientId>',
    },
  },
});
```

Wrap your application with `AuthProvider`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@snowflake/core-auth';

import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

## Roadmap

### Short Term Goals

1. Abstract the dependency on AWS Cognito.
2. Add support for environment-agnostic configuration.
3. Improve documentation and examples.

### Long Term Goals

1. Introduce support for multiple authentication providers (e.g., Azure AD, custom backends).
2. Develop a lightweight UI toolkit for authentication components.
3. Enhance session management capabilities with token refresh and revocation.
