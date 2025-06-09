import type { Handle } from '@sveltejs/kit';

import * as auth from './auth';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(auth.sessionCookieName);

  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { user, session } = await auth.validateSession(sessionId);

  if (session) {
    auth.setSessionIdCookie(event, sessionId, session.expiresAt);
  } else {
    auth.deleteSessionIdCookie(event);
  }

  event.locals.user = user;
  event.locals.session = session;

  return resolve(event);
};
