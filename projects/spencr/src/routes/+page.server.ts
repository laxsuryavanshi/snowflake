import { requireLogin } from '$lib/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  await requireLogin();
};
