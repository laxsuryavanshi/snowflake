import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from './db';
import * as schema from './db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const sessionId = encodeBase64url(bytes);
  return sessionId;
}

export async function createSession(id: string, userId: string): Promise<schema.Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(id)));

  const session: schema.Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + DAY_IN_MS * 15), // 15 days
  };

  await db.insert(schema.session).values(session);
  return session;
}

export interface SessionValidationResult {
  user: Omit<schema.User, 'password'> | null;
  session: schema.Session | null;
}

export async function validateSession(id: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(id)));
  const [result] = await db
    .select({
      user: { id: schema.user.id, username: schema.user.username, name: schema.user.name },
      session: schema.session,
    })
    .from(schema.session)
    .innerJoin(schema.user, eq(schema.session.userId, schema.user.id))
    .where(eq(schema.session.id, sessionId))
    .limit(1);

  if (!result) {
    return { session: null, user: null };
  }

  const { session, user } = result;

  const sessionExpired = session.expiresAt.getTime() < Date.now();
  if (sessionExpired) {
    await invalidateSession(session.id);
    return { session: null, user: null };
  }

  const renewSession = session.expiresAt.getTime() - Date.now() < DAY_IN_MS * 2;
  if (renewSession) {
    session.expiresAt = new Date(Date.now() + DAY_IN_MS * 15); // Renew for another 15 days
    await db
      .update(schema.session)
      .set({ expiresAt: session.expiresAt })
      .where(eq(schema.session.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(sessionId: string) {
  await db.delete(schema.session).where(eq(schema.session.id, sessionId));
}

export function setSessionIdCookie(event: RequestEvent, id: string, expiresAt: Date) {
  event.cookies.set(sessionCookieName, id, {
    expires: expiresAt,
    path: '/',
  });
}

export function deleteSessionIdCookie(event: RequestEvent) {
  event.cookies.delete(sessionCookieName, {
    path: '/',
  });
}
