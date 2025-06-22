import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';

import { LOGIN_URL } from '$lib/constants';
import { account, db, session, user } from '../db';
import { authorize } from './helpers';

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: DrizzleAdapter(db, {
    accountsTable: account,
    sessionsTable: session,
    usersTable: user,
  }),
  providers: [
    Credentials({
      credentials: {
        email: {
          label: 'email',
          type: 'text',
          placeholder: 'Email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Password',
        },
      },
      authorize: authorize,
    }),
  ],
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
