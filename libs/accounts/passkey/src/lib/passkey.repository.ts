/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Pure data access functions for passkey storage using Kysely query builder.
 *
 * These are pure functions that take the database instance as the first parameter,
 * following the functional repository pattern used throughout FxA.
 *
 * Note: On successful authentication, update:
 * - lastUsedAt: Current timestamp
 * - signCount: Value from authenticator data (should increment)
 * - backupState: Current backup state flag (BS) from authenticator data (0 or 1)
 *
 * On registration:
 * - Set backupEligible from authenticator data (BE flag) - 0 or 1
 * - Set backupState from authenticator data (BS flag) - 0 or 1
 * - Leave lastUsedAt as NULL (never used for authentication)
 *
 * On failed authentication, do not update anything.
 *
 * Type conversion: Backup flags are stored as TINYINT(1) in MySQL (0 or 1).
 * - For INSERT/UPDATE: Pass numbers (0 or 1)
 * - For SELECT: Kysely returns booleans (false or true)
 */

import type {
  AccountDatabase,
  Passkey,
  NewPasskey,
} from '@fxa/shared/db/mysql/account';

/**
 * Find all passkeys for a given user.
 *
 * Note: Results are not ordered. The number of passkeys per user will be
 * constrained (typically < 10), so ordering is not necessary and clients
 * can sort as needed.
 *
 * @param db - Database instance
 * @param uid - User ID (16-byte Buffer)
 * @returns Array of passkeys for the user (unordered)
 */
export async function findPasskeysByUid(
  db: AccountDatabase,
  uid: Buffer
): Promise<Passkey[]> {
  return await db
    .selectFrom('passkeys')
    .selectAll()
    .where('uid', '=', uid)
    .execute();
}

/**
 * Find a passkey by its credential ID.
 *
 * @param db - Database instance
 * @param credentialId - WebAuthn credential ID (Buffer)
 * @returns Passkey if found, undefined otherwise
 */
export async function findPasskeyByCredentialId(
  db: AccountDatabase,
  credentialId: Buffer
): Promise<Passkey | undefined> {
  return await db
    .selectFrom('passkeys')
    .selectAll()
    .where('credentialId', '=', credentialId)
    .executeTakeFirst();
}

/**
 * Insert a new passkey record.
 *
 * @param db - Database instance
 * @param passkey - New passkey data to insert
 */
export async function insertPasskey(
  db: AccountDatabase,
  passkey: NewPasskey
): Promise<void> {
  await db.insertInto('passkeys').values(passkey).execute();
}

/**
 * Update passkey metadata after successful authentication.
 *
 * Updates lastUsedAt, signCount, and backupState for a passkey.
 * Should only be called after successful authentication.
 *
 * @param db - Database instance
 * @param credentialId - WebAuthn credential ID (Buffer)
 * @param signCount - New signature count from authenticator data
 * @param backupState - Current backup state flag (0 or 1) from authenticator data
 * @returns true if a passkey was updated, false otherwise
 */
export async function updatePasskeyCounterAndLastUsed(
  db: AccountDatabase,
  credentialId: Buffer,
  signCount: number,
  backupState: number
): Promise<boolean> {
  const result = await db
    .updateTable('passkeys')
    .set({
      lastUsedAt: Date.now(),
      signCount: signCount,
      backupState: backupState,
    })
    .where('credentialId', '=', credentialId)
    .executeTakeFirst();

  return result.numUpdatedRows === BigInt(1);
}

/**
 * Update the friendly name for a passkey.
 *
 * @param db - Database instance
 * @param credentialId - WebAuthn credential ID (Buffer)
 * @param name - New friendly name for the passkey
 * @returns Number of rows updated (should be 1 if successful)
 */
export async function updatePasskeyName(
  db: AccountDatabase,
  credentialId: Buffer,
  name: string
): Promise<number> {
  const result = await db
    .updateTable('passkeys')
    .set({ name })
    .where('credentialId', '=', credentialId)
    .executeTakeFirst();

  return Number(result.numUpdatedRows);
}

/**
 * Delete a specific passkey for a user.
 *
 * @param db - Database instance
 * @param uid - User ID (16-byte Buffer)
 * @param credentialId - WebAuthn credential ID (Buffer)
 * @returns true if a passkey was deleted, false otherwise
 */
export async function deletePasskey(
  db: AccountDatabase,
  uid: Buffer,
  credentialId: Buffer
): Promise<boolean> {
  const result = await db
    .deleteFrom('passkeys')
    .where('uid', '=', uid)
    .where('credentialId', '=', credentialId)
    .executeTakeFirst();

  return result.numDeletedRows === BigInt(1);
}

/**
 * Delete all passkeys for a user.
 *
 * @param db - Database instance
 * @param uid - User ID (16-byte Buffer)
 * @returns Number of passkeys deleted
 */
export async function deleteAllPasskeysForUser(
  db: AccountDatabase,
  uid: Buffer
): Promise<number> {
  const result = await db
    .deleteFrom('passkeys')
    .where('uid', '=', uid)
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}

/**
 * Count the number of passkeys for a user.
 *
 * @param db - Database instance
 * @param uid - User ID (16-byte Buffer)
 * @returns Number of passkeys for the user
 */
export async function countPasskeysByUid(
  db: AccountDatabase,
  uid: Buffer
): Promise<number> {
  const result = await db
    .selectFrom('passkeys')
    .select(db.fn.count('credentialId').as('count'))
    .where('uid', '=', uid)
    .executeTakeFirst();

  return Number(result?.count ?? 0);
}
