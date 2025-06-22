import type { Session, User } from '@auth/sveltekit';
import { hash, verify } from '@node-rs/argon2';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { getRequestEvent } from '$app/server';
import { LOGIN_URL } from '$lib/constants';
import { db, user } from '../db';
import { InvalidCredentialsError } from './errors';

export async function requireLogin(): Promise<Session | null> {
  const { locals } = getRequestEvent();

  const session = await locals.auth();

  if (!session) {
    redirect(302, LOGIN_URL);
    return null;
  }

  return session;
}

export async function requireAnonymous(): Promise<void> {
  const { locals, url } = getRequestEvent();

  const session = await locals.auth();

  if (session) {
    const next = url.searchParams.get('next') ?? '/';
    redirect(302, next);
  }
}

export type CredentialsInputs = 'email' | 'password';

const SignInSchema = z.object({
  email: z.email().nonoptional(),
  password: z.string().nonempty(),
});

export async function authorize(
  credentials: Partial<Record<CredentialsInputs, unknown>>
): Promise<User | null> {
  try {
    const { email, password } = await SignInSchema.parseAsync(credentials);

    const users = await db.select().from(user).where(eq(user.email, email));

    const existingUser = users.at(0);
    if (!existingUser) {
      await hash(password); // to prevent timing attacks
      throw new InvalidCredentialsError();
    }

    const match = await verify(existingUser.password, password);
    if (!match) {
      throw new InvalidCredentialsError();
    }

    return existingUser;
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new InvalidCredentialsError();
    }

    throw err;
  }
}
