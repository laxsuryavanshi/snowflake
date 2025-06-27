import { isRedirect } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { user } from '../db';
import { InvalidCredentialsError } from './errors';
import { authorize, requireAnonymous, requireLogin } from './helpers';

const mocks = vi.hoisted(() => {
  return {
    db: vi.mockObject({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn(),
        }),
      }),
    }),
    eq: vi.fn(),
    getRequestEvent: vi.fn(),
    hash: vi.fn(),
    verify: vi.fn(),
    where: vi.fn(),
  };
});

vi.mock('@node-rs/argon2', async importOriginal => {
  return {
    ...(await importOriginal<typeof import('@node-rs/argon2')>()),
    hash: mocks.hash,
    verify: mocks.verify,
  };
});
vi.mock('drizzle-orm', async importOriginal => {
  return {
    ...(await importOriginal<typeof import('drizzle-orm')>()),
    eq: mocks.eq,
  };
});
vi.mock('$app/server', async importOriginal => {
  return {
    ...(await importOriginal<typeof import('$app/server')>()),
    getRequestEvent: mocks.getRequestEvent,
  };
});
vi.mock('../db', async importOriginal => {
  return {
    ...(await importOriginal<typeof import('../db')>()),
    db: mocks.db,
  };
});

describe('auth helper functions', () => {
  const authFn = vi.fn();

  mocks.getRequestEvent.mockReturnValue({
    locals: { auth: authFn },
    url: { searchParams: { get: () => undefined } },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('requireLogin', () => {
    it('should redirect unauthenticated user to login', async () => {
      authFn.mockResolvedValue(null);
      let redirected;

      try {
        await requireLogin();
      } catch (err) {
        redirected = isRedirect(err);
      }

      expect(redirected).toBe(true);
    });

    it('should not redirect authenticated user to login', async () => {
      authFn.mockResolvedValue({ user: {} });

      const session = await requireLogin();
      expect(session).toBeTruthy();
    });
  });

  describe('requireAnonymous', () => {
    it('should redirect authenticated user to next', async () => {
      authFn.mockResolvedValue({ user: {} });
      let redirected;

      try {
        await requireAnonymous();
      } catch (err) {
        redirected = isRedirect(err);
      }

      expect(redirected).toBe(true);
    });

    it('should do nothing for unauthenticated user', async () => {
      authFn.mockResolvedValue(null);

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(await requireAnonymous()).toBeUndefined();
    });
  });
});

describe('authorize', () => {
  const email = 'host@domain.tld';
  const password = 'password';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('invalid credentials', () => {
    it('should throw error when email is missing', async () => {
      await expect(async () => {
        await authorize({ email: null, password });
      }).rejects.toThrow(InvalidCredentialsError);
      await expect(async () => {
        await authorize({ email: undefined, password });
      }).rejects.toThrow(InvalidCredentialsError);
      await expect(async () => {
        await authorize({ email: '', password });
      }).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw error for malformed email', async () => {
      await expect(async () => {
        await authorize({ email: password, password });
      }).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw error when password is missing', async () => {
      await expect(async () => {
        await authorize({ email, password: null });
      }).rejects.toThrow(InvalidCredentialsError);
      await expect(async () => {
        await authorize({ email, password: undefined });
      }).rejects.toThrow(InvalidCredentialsError);
      await expect(async () => {
        await authorize({ email, password: '' });
      }).rejects.toThrow(InvalidCredentialsError);
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    mocks.db.select().from().where.mockResolvedValue([]);
    it('should return null when user does not exist', async () => {
      await expect(async () => {
        await authorize({ email, password });
      }).rejects.toThrow(InvalidCredentialsError);

      // it should find user using email
      expect(mocks.eq).toHaveBeenCalledExactlyOnceWith(user.email, email);
      // to prevent timing attacks
      expect(mocks.hash).toHaveBeenCalledExactlyOnceWith(password);
      expect(mocks.verify).not.toHaveBeenCalled();
    });

    it('should return null when password does not match', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mocks.db.select().from().where.mockResolvedValue([{ password }]);
      mocks.verify.mockResolvedValue(false);

      await expect(async () => {
        await authorize({ email, password });
      }).rejects.toThrow(InvalidCredentialsError);

      // it should find user using email
      expect(mocks.eq).toHaveBeenCalledExactlyOnceWith(user.email, email);
      expect(mocks.verify).toHaveBeenCalledExactlyOnceWith(password, password);
    });
  });

  describe('Authorization', () => {
    it('should return user when authorization is successful', async () => {
      const user = { email, password };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mocks.db.select().from().where.mockResolvedValue([user]);
      mocks.verify.mockResolvedValue(true);

      expect(await authorize({ email, password })).toBe(user);
    });
  });
});
