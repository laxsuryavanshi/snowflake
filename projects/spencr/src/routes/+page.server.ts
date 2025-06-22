import { requireLogin } from '$lib/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  await requireLogin();
};
