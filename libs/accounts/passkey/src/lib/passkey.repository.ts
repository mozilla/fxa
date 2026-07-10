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

import { uuidTransformer } from '@fxa/shared/db/mysql/core';
import type {
  AccountDatabase,
  Passkey,
  NewPasskey,
} from '@fxa/shared/db/mysql/account';

const BASE64URL_RE = /^[A-Za-z0-9_-]+$/;
const AAGUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Convert a base64url-encoded credential ID to a Buffer, validating format.
 *
 * Mirrors `uuidTransformer.to` for hex uids: catches malformed input at the
 * DB boundary instead of silently coercing it to garbage bytes. Throws on
 * any character outside the base64url alphabet.
 */
export function base64urlToBuffer(value: string): Buffer {
  if (!BASE64URL_RE.test(value)) {
    throw new Error('Invalid base64url data');
  }
  return Buffer.from(value, 'base64url');
}

/**
 * Convert a hyphenated-UUID aaguid string to a 16-byte Buffer for DB storage.
 *
 * Validates the hyphenated-UUID format and throws on malformed input, so we
 * fail loudly at the conversion boundary instead of silently writing short
 * or garbage bytes to the BINARY(16) column.
 *
 * @param aaguid - Hyphenated-UUID aaguid string from SimpleWebAuthn
 */
export function aaguidToBuffer(aaguid: string): Buffer {
  if (!AAGUID_RE.test(aaguid)) {
    throw new Error('Invalid aaguid format');
  }
  return Buffer.from(aaguid.replace(/-/g, ''), 'hex');
}

/**
 * Convert a 16-byte aaguid Buffer (as stored in the DB) back to its
 * conventional hyphenated-UUID string form.
 *
 * @param buf - 16-byte Buffer
 */
export function bufferToAaguid(buf: Buffer): string {
  const hex = buf.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Fields needed to persist a new passkey, minus the owning user's uid.
 *
 * The uid is passed as a separate hex-string argument; `credentialId` is a
 * base64url string; `aaguid` is a hyphenated-UUID string. The service and
 * manager stay free of DB-layer `Buffer` conversions — the repository
 * converts at the DB boundary.
 */
export type NewPasskeyData = Omit<
  Passkey,
  'uid' | 'credentialId' | 'aaguid'
> & {
  /** WebAuthn credential ID as a base64url string. */
  credentialId: string;
  /** Authenticator aaguid as a hyphenated-UUID string. */
  aaguid: string;
};

/**
 * Passkey row as seen by the rest of the app. Mirrors the DB-row shape but
 * exposes `credentialId` as a base64url string and `aaguid` as a
 * hyphenated-UUID string, so callers never touch the raw bytes.
 */
export type PasskeyRecord = Omit<Passkey, 'aaguid' | 'credentialId'> & {
  aaguid: string;
  credentialId: string;
};

function toPasskeyRecord(row: Passkey): PasskeyRecord {
  return {
    ...row,
    aaguid: bufferToAaguid(row.aaguid),
    credentialId: row.credentialId.toString('base64url'),
  };
}

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
 * @param uid - User ID as a hex string
 * @returns Array of passkeys ordered by createdAt descending
 */
export async function findPasskeysByUid(
  db: AccountDatabase,
  uid: string
): Promise<PasskeyRecord[]> {
  const rows = await db
    .selectFrom('passkeys')
    .selectAll()
    .where('uid', '=', uuidTransformer.to(uid))
    .orderBy('createdAt', 'desc')
    .orderBy('credentialId', 'asc')
    .execute();
  return rows.map(toPasskeyRecord);
}

/**
 * Find a passkey by its credential ID.
 *
 * @param db - Database instance
 * @param credentialId - WebAuthn credential ID as a base64url string
 * @returns Passkey if found, undefined otherwise
 */
export async function findPasskeyByCredentialId(
  db: AccountDatabase,
  credentialId: string
): Promise<PasskeyRecord | undefined> {
  const row = await db
    .selectFrom('passkeys')
    .selectAll()
    .where('credentialId', '=', base64urlToBuffer(credentialId))
    .executeTakeFirst();
  return row && toPasskeyRecord(row);
}

/**
 * Insert a new passkey record.
 *
 * @param db - Database instance
 * @param uid - Owning user's ID as a hex string
 * @param data - Passkey fields to persist (uid passed separately)
 */
export async function insertPasskey(
  db: AccountDatabase,
  uid: string,
  data: NewPasskeyData
): Promise<void> {
  const newPasskey: NewPasskey = {
    ...data,
    uid: uuidTransformer.to(uid),
    credentialId: base64urlToBuffer(data.credentialId),
    aaguid: aaguidToBuffer(data.aaguid),
    transports: JSON.stringify(data.transports),
    backupEligible: data.backupEligible ? 1 : 0,
    backupState: data.backupState ? 1 : 0,
    prfEnabled: data.prfEnabled ? 1 : 0,
  };
  await db.insertInto('passkeys').values(newPasskey).execute();
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
 * @param uid - User ID as a hex string
 * @param credentialId - WebAuthn credential ID as a base64url string
 * @param signCount - Verified new signature count from authenticator data
 * @param backupState - Current backup state flag from authenticator data
 * @returns true if updated, false if credential not found or concurrent write conflict
 */
export async function updatePasskeyCounterAndLastUsed(
  db: AccountDatabase,
  uid: string,
  credentialId: string,
  signCount: number,
  backupState: boolean
): Promise<boolean> {
  const result = await db
    .updateTable('passkeys')
    .set({
      lastUsedAt: Date.now(),
      signCount: signCount,
      backupState: backupState ? 1 : 0,
    })
    .where('uid', '=', uuidTransformer.to(uid))
    .where('credentialId', '=', base64urlToBuffer(credentialId))
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
 * @param uid - User ID as a hex string
 * @param credentialId - WebAuthn credential ID as a base64url string
 * @param name - New friendly name for the passkey
 * @returns Number of rows updated (1 if successful, 0 if not found or wrong user)
 */
export async function updatePasskeyName(
  db: AccountDatabase,
  uid: string,
  credentialId: string,
  name: string
): Promise<number> {
  const result = await db
    .updateTable('passkeys')
    .set({ name })
    .where('uid', '=', uuidTransformer.to(uid))
    .where('credentialId', '=', base64urlToBuffer(credentialId))
    .executeTakeFirst();

  return Number(result.numUpdatedRows);
}

/**
 * Delete a specific passkey for a user.
 *
 * @param db - Database instance
 * @param uid - User ID as a hex string
 * @param credentialId - WebAuthn credential ID as a base64url string
 * @returns true if a passkey was deleted, false otherwise
 */
export async function deletePasskey(
  db: AccountDatabase,
  uid: string,
  credentialId: string
): Promise<boolean> {
  const result = await db
    .deleteFrom('passkeys')
    .where('uid', '=', uuidTransformer.to(uid))
    .where('credentialId', '=', base64urlToBuffer(credentialId))
    .executeTakeFirst();

  return result.numDeletedRows === BigInt(1);
}

/**
 * Delete all passkeys for a user.
 *
 * @param db - Database instance
 * @param uid - User ID as a hex string
 * @returns Number of passkeys deleted
 */
export async function deleteAllPasskeysForUser(
  db: AccountDatabase,
  uid: string
): Promise<number> {
  const result = await db
    .deleteFrom('passkeys')
    .where('uid', '=', uuidTransformer.to(uid))
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}

/**
 * Count the number of passkeys for a user.
 *
 * @param db - Database instance
 * @param uid - User ID as a hex string
 * @returns Number of passkeys for the user
 */
export async function countPasskeysByUid(
  db: AccountDatabase,
  uid: string
): Promise<number> {
  const result = await db
    .selectFrom('passkeys')
    .select(db.fn.count('credentialId').as('count'))
    .where('uid', '=', uuidTransformer.to(uid))
    .executeTakeFirst();

  return Number(result?.count ?? 0);
}
