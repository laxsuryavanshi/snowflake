import { CredentialsSignin } from '@auth/sveltekit';
import { error, fail, isRedirect } from '@sveltejs/kit';

import { providerMap, requireAnonymous, signIn } from '$lib/server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  await requireAnonymous();

  return {
    providers: providerMap,
  };
};

export const actions: Actions = {
  login: async event => {
    try {
      return await signIn(event);
    } catch (err) {
      if (isRedirect(err)) {
        throw err;
      }
      if (err instanceof CredentialsSignin) {
        return fail(400, { message: err.message });
      }
      return error(500, { message: 'Internal server error' });
    }
  },
};
