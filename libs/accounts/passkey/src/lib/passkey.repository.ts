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
 * Type guard for MySQL duplicate-entry errors (ER_DUP_ENTRY).
 *
 * Use this instead of `err.code === 'ER_DUP_ENTRY'` on an `any`-typed catch
 * variable. Safe to use with `catch (err: unknown)`.
 */
export function isMysqlDupEntry(err: unknown): err is { code: 'ER_DUP_ENTRY' } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'ER_DUP_ENTRY'
  );
}

/**
 * Find all passkeys for a given user, ordered by creation date newest-first.
 *
 * @param db - Database instance
 * @param uid - User ID (16-byte Buffer)
 * @returns Array of passkeys ordered by createdAt descending
 */
export async function findPasskeysByUid(
  db: AccountDatabase,
  uid: Buffer
): Promise<Passkey[]> {
  return await db
    .selectFrom('passkeys')
    .selectAll()
    .where('uid', '=', uid)
    .orderBy('createdAt', 'desc')
    .orderBy('credentialId', 'asc')
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
 * Must only be called after the WebAuthn assertion has been fully verified
 * by the service layer, including signCount validation.
 *
 * The WHERE clause enforces two cases per the WebAuthn spec:
 * - newSignCount > 0: stored must be strictly less than new (normal increment)
 * - newSignCount = 0: stored must also be 0 (authenticators that never increment)
 * Identical non-zero counters are rejected as a potential cloning signal.
 *
 * This is a data integrity guard against concurrent writes — not the primary
 * protection against replay or cloning attacks. Replays are blocked by
 * single-use challenge validation, and clone detection is performed by
 * verifyAuthenticationResponse() before this function is called.
 *
 * @param db - Database instance
 * @param uid - User ID (16-byte Buffer)
 * @param credentialId - WebAuthn credential ID (Buffer)
 * @param signCount - Verified new signature count from authenticator data
 * @param backupState - Current backup state flag (0 or 1) from authenticator data
 * @returns true if updated, false if credential not found or concurrent write conflict
 */
export async function updatePasskeyCounterAndLastUsed(
  db: AccountDatabase,
  uid: Buffer,
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
    .where('uid', '=', uid)
    .where('credentialId', '=', credentialId)
    .where((eb) =>
      // Per WebAuthn spec: authenticators that never increment always return 0
      // (both stored and new must be 0). For all other authenticators, the new
      // value must be strictly greater than the stored value.
      signCount === 0
        ? eb('signCount', '=', 0)
        : eb('signCount', '<', signCount)
    )
    .executeTakeFirst();

  return result.numUpdatedRows === BigInt(1);
}

/**
 * Update the friendly name for a passkey.
 *
 * Both uid and credentialId must match so that one user cannot rename
 * another user's passkey with a known credential ID.
 *
 * @param db - Database instance
 * @param uid - User ID (16-byte Buffer)
 * @param credentialId - WebAuthn credential ID (Buffer)
 * @param name - New friendly name for the passkey
 * @returns Number of rows updated (1 if successful, 0 if not found or wrong user)
 */
export async function updatePasskeyName(
  db: AccountDatabase,
  uid: Buffer,
  credentialId: Buffer,
  name: string
): Promise<number> {
  const result = await db
    .updateTable('passkeys')
    .set({ name })
    .where('uid', '=', uid)
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
