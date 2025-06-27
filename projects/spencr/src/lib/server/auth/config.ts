import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { SvelteKitAuth } from '@auth/sveltekit';
import type { Provider } from '@auth/sveltekit/providers';
import Credentials from '@auth/sveltekit/providers/credentials';
import GitHub from '@auth/sveltekit/providers/github';
import Google from '@auth/sveltekit/providers/google';

import { LOGIN_URL } from '$lib/constants';
import { account, authenticator, db, session, user, verificationToken } from '../db';
import { authorize } from './helpers';

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: authorize,
  }),
  GitHub,
  Google,
];

export const providerMap = providers.map(provider => {
  if (typeof provider === 'function') {
    const config = provider();
    return {
      id: config.id,
      type: config.type,
      name: config.name,
      options: config.type === 'credentials' ? config.credentials : {},
    };
  }

  return {
    id: provider.id,
    type: provider.type,
    name: provider.name,
    options: provider.type === 'credentials' ? provider.credentials : {},
  };
});

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: DrizzleAdapter(db, {
    accountsTable: account,
    authenticatorsTable: authenticator,
    sessionsTable: session,
    usersTable: user,
    verificationTokensTable: verificationToken,
  }),
  providers,
  pages: {
    signIn: LOGIN_URL,
  },
  session: {
    // Auth.js doesn't support 'database' session strategy with Credentials provider
    // https://errors.authjs.dev#unsupportedstrategy
    strategy: 'jwt',
  },
  trustHost: true,
});
