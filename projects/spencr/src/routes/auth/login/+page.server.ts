import { CredentialsSignin } from '@auth/sveltekit';
import { fail } from '@sveltejs/kit';

import { authorize, requireAnonymous } from '$lib/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  await requireAnonymous();
};

export const actions: Actions = {
  login: async event => {
    const formData = await event.request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      return await authorize({ email, password });
    } catch (err) {
      const message = err instanceof CredentialsSignin ? err.message : `${err}`;
      return fail(401, { message });
    }
  },
};
