/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Pure data access functions for the passkey wrap envelope, following the same
 * functional repository pattern as `passkey.repository.ts`.
 *
 * The envelope is opaque here. Every field is a fixed-width binary from the
 * client's `passkey-crypto` module, stored and returned uninterpreted. `kB` and
 * `skR` never reach this process.
 */

import { uuidTransformer } from '@fxa/shared/db/mysql/core';
import type {
  AccountDatabase,
  NewPasskeyWrap,
  PasskeyWrap,
} from '@fxa/shared/db/mysql/account';
import { base64urlToBuffer } from './passkey.repository';

/**
 * Widths the v1 ciphersuite produces, matching the BINARY columns.
 *
 * Checked here because MySQL right-pads a short BINARY value instead of
 * rejecting it, which corrupts the envelope permanently. Routes validate
 * the same widths at the API boundary; this is the last layer that can
 * still refuse the write.
 */
export const V1_WIDTHS = {
  pkR: 133,
  prfWrappedSkR: 82,
  keyWrapIv: 12,
  hpkeEncapsulatedSecret: 133,
  hpkeSealedKb: 48,
} as const;

/**
 * Compares given width to the v1 width for a field, throwing if it does not match.
 * @param name - Field name, for the error message
 * @param value - Buffer to check
 * @throws If the buffer is not the expected width
 */
function assertWidth(name: keyof typeof V1_WIDTHS, value: Buffer): void {
  if (value.length !== V1_WIDTHS[name]) {
    throw new Error(
      `${name} must be ${V1_WIDTHS[name]} bytes, got ${value.length}`
    );
  }
}

/**
 * The binary fields a caller supplies when storing a wrap.
 */
export type PasskeyWrapEnvelope = {
  pkR: Buffer;
  prfWrappedSkR: Buffer;
  keyWrapIv: Buffer;
  hpkeEncapsulatedSecret: Buffer;
  hpkeSealedKb: Buffer;
};

/**
 * The envelope as it crosses the API boundary, before any encoding.
 */
export type NewPasskeyWrapData = PasskeyWrapEnvelope & {
  credentialId: string;
};

/**
 * Find the wrap for one credential.
 *
 * @param db - Database instance
 * @param uid - User ID as a hex string
 * @param credentialId - Credential ID, base64url-encoded
 * @returns The wrap, or undefined when the credential has none
 */
export async function findPasskeyWrap(
  db: AccountDatabase,
  uid: string,
  credentialId: string
): Promise<PasskeyWrap | undefined> {
  return db
    .selectFrom('passkeyWraps')
    .selectAll()
    .where('uid', '=', uuidTransformer.to(uid))
    .where('credentialId', '=', base64urlToBuffer(credentialId))
    .executeTakeFirst();
}

/**
 * Insert a wrap for a credential that has none.
 *
 * A second wrap for the same credential hits the primary key and throws.
 *
 * @param db - Database instance
 * @param uid - User ID as a hex string
 * @param data - The envelope
 * @param createdAt - Server-set timestamp
 */
export async function insertPasskeyWrap(
  db: AccountDatabase,
  uid: string,
  data: NewPasskeyWrapData,
  createdAt: number
): Promise<void> {
  assertWidth('pkR', data.pkR);
  assertWidth('prfWrappedSkR', data.prfWrappedSkR);
  assertWidth('keyWrapIv', data.keyWrapIv);
  assertWidth('hpkeEncapsulatedSecret', data.hpkeEncapsulatedSecret);
  assertWidth('hpkeSealedKb', data.hpkeSealedKb);

  const newWrap: NewPasskeyWrap = {
    credentialId: base64urlToBuffer(data.credentialId),
    pkR: data.pkR,
    prfWrappedSkR: data.prfWrappedSkR,
    keyWrapIv: data.keyWrapIv,
    hpkeEncapsulatedSecret: data.hpkeEncapsulatedSecret,
    hpkeSealedKb: data.hpkeSealedKb,
    createdAt,
    uid: uuidTransformer.to(uid),
  };

  await db.insertInto('passkeyWraps').values(newWrap).execute();
}

/**
 * Delete every wrap for a user, leaving their passkeys in place.
 *
 * For the password-reset path: a reset invalidates `kB`, so every sealed envelope
 * becomes undecryptable while the credentials stay usable for re-enrolment.
 * Deleting a passkey needs no counterpart — the foreign key cascades.
 *
 * @returns Number of wraps deleted
 */
export async function deleteAllPasskeyWrapsForUser(
  db: AccountDatabase,
  uid: string
): Promise<number> {
  const result = await db
    .deleteFrom('passkeyWraps')
    .where('uid', '=', uuidTransformer.to(uid))
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}
