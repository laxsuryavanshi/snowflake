import { requireAnonymous, signIn } from '$lib/auth';
import { CredentialsSignin } from '@auth/sveltekit';
import { error, fail, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  await requireAnonymous();
};

export const actions: Actions = {
  login: async event => {
    try {
      return await signIn(event);
    } catch (err) {
      if (isRedirect(err)) {
        return;
      }
      if (err instanceof CredentialsSignin) {
        return fail(400, { message: err.message });
      }
      return error(500, { message: 'Internal server error' });
    }
  },
};
