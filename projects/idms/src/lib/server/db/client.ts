import { drizzle } from 'drizzle-orm/node-postgres';

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!building && !env.DATABASE_URL) {
  throw new Error("'DATABASE_URL' environment variable is not set");
}

export const db = drizzle(env.DATABASE_URL, { schema, casing: 'snake_case' });
