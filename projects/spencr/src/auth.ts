import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';

import { authorize } from '$lib/auth';
import { LOGIN_URL } from '$lib/constants';
import { account, db, session, user } from '$lib/db';

export const { handle } = SvelteKitAuth({
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
      authorize,
    }),
  ],
  pages: {
    signIn: LOGIN_URL,
  },
});
