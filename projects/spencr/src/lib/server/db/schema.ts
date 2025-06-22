import type { AdapterAccountType } from '@auth/sveltekit/adapters';
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: timestamp({ mode: 'date' }),
  password: varchar({ length: 127 }).notNull(),
  name: varchar({ length: 255 }),
  image: varchar({ length: 255 }),
});

export const account = pgTable(
  'account',
  {
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: varchar({ length: 15 }).$type<AdapterAccountType>().notNull(),
    provider: varchar({ length: 127 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  account => [
    {
      compositePk: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const session = pgTable('session', {
  sessionToken: varchar({ length: 255 }).primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp({ mode: 'date' }).notNull(),
});

export const verificationToken = pgTable(
  'verification_token',
  {
    identifier: varchar({ length: 255 }).notNull(),
    token: varchar({ length: 255 }).notNull(),
    expires: timestamp({ mode: 'date' }).notNull(),
  },
  verificationToken => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticator = pgTable(
  'authenticator',
  {
    credentialID: varchar({ length: 255 }).notNull().unique(),
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    providerAccountId: varchar({ length: 255 }).notNull(),
    credentialPublicKey: text().notNull(),
    counter: integer().notNull(),
    credentialDeviceType: varchar({ length: 255 }).notNull(),
    credentialBackedUp: boolean().notNull(),
    transports: varchar({ length: 255 }),
  },
  authenticator => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

export type User = typeof user.$inferSelect;

export type Account = typeof account.$inferSelect;

export type Session = typeof session.$inferSelect;

export type VerificationToken = typeof verificationToken.$inferSelect;

export type Authenticator = typeof authenticator.$inferInsert;
