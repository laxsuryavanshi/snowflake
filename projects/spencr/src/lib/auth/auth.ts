import type { Session, User } from '@auth/sveltekit';
import { hash, verify } from '@node-rs/argon2';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { getRequestEvent } from '$app/server';
import { LOGIN_URL } from '../constants';
import { db, user } from '../db';
import { InvalidCredentialsError, MissingCredentialsError } from './errors';

export async function requireLogin(): Promise<Session> {
  const { locals } = getRequestEvent();

  const session = await locals.auth();

  if (!session) {
    return redirect(302, LOGIN_URL);
  }

  return session;
}

export async function requireAnonymous() {
  const { locals, url } = getRequestEvent();

  const session = await locals.auth();

  if (session) {
    const next = url.searchParams.get('next') ?? '/';
    return redirect(302, next);
  }
}

export type CredentialsInputs = 'email' | 'password';

export async function authorize(
  credentials: Partial<Record<CredentialsInputs, unknown>>
): Promise<User | null> {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new MissingCredentialsError();
  }

  const users = await db
    .select()
    .from(user)
    .where(eq(user.email, email as string));

  const existingUser = users.at(0);
  if (!existingUser) {
    await hash(password as string); // to prevent timing attacks
    throw new InvalidCredentialsError();
  }

  const match = await verify(existingUser.password, password as string);
  if (!match) {
    throw new InvalidCredentialsError();
  }

  return existingUser;
}
