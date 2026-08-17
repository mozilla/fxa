/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Pure data access functions for the passkey wrap envelope, following the same
 * functional repository pattern as `passkey.repository.ts`.
 *
 * The envelope is opaque here: every field is fixed-width binary from the
 * client's `passkey-crypto` module, stored and returned uninterpreted — `kB` and
 * `skR` never reach this process. Widths are validated at the API boundary
 * (FXA-13142), so these functions take the bytes as given.
 */

import { uuidTransformer } from '@fxa/shared/db/mysql/core';
import type {
  AccountDatabase,
  NewPasskeyWrap,
  PasskeyWrap,
  PasskeyWrapUpdate,
} from '@fxa/shared/db/mysql/account';
import { base64urlToBuffer } from './passkey.repository';

/**
 * Envelope format version written with every row.
 *
 * Set explicitly rather than left to the column default, so the value a writer
 * intended is visible here rather than in a migration. A second format means a
 * second constant and a dispatched read path, never an edit to this one.
 */
export const ENVELOPE_VERSION = 1;

/**
 * Widths the v1 ciphersuite produces, matching the BINARY columns.
 *
 * Checked here because MySQL right-pads a short BINARY value instead of
 * rejecting it, which corrupts the envelope permanently — it can never be
 * re-derived. FXA-13142 validates the same widths at the API boundary; this is
 * the last layer that can still refuse the write.
 */
const V1_WIDTHS = {
  pkR: 133,
  prfWrappedSkR: 82,
  keyWrapIv: 12,
  hpkeEncapsulatedSecret: 133,
  hpkeSealedKb: 48,
} as const;

function assertWidth(name: keyof typeof V1_WIDTHS, value: Buffer): void {
  if (value.length !== V1_WIDTHS[name]) {
    throw new Error(
      `${name} must be ${V1_WIDTHS[name]} bytes, got ${value.length}`
    );
  }
}

/** The five binary fields a caller supplies when storing a wrap. */
export type PasskeyWrapEnvelope = {
  pkR: Buffer;
  prfWrappedSkR: Buffer;
  keyWrapIv: Buffer;
  hpkeEncapsulatedSecret: Buffer;
  hpkeSealedKb: Buffer;
};

/** The envelope as it crosses the API boundary, before any encoding. */
export type NewPasskeyWrapData = PasskeyWrapEnvelope & {
  credentialId: string;
};

/** The two fields a kB rotation replaces. `skR` is untouched. */
export type PasskeyWrapSealUpdate = {
  hpkeEncapsulatedSecret: Buffer;
  hpkeSealedKb: Buffer;
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
 * Insert a wrap.
 *
 * Relies on the primary key to reject a second wrap for the same credential;
 * callers distinguish "exists, identical" from "exists, different" before
 * reaching here (FXA-13142).
 *
 * @param db - Database instance
 * @param uid - User ID as a hex string
 * @param data - The envelope
 * @param createdAt - Server-set timestamp, also used for updatedAt
 */
export async function insertPasskeyWrap(
  db: AccountDatabase,
  uid: string,
  data: NewPasskeyWrapData,
  createdAt: number
): Promise<void> {
  // Listed rather than spread, for the same reason as the update below: a spread
  // lands after `uid`, so an extra runtime `uid` on `data` would replace the
  // authenticated one. Excess-property checks do not apply to a parameter.
  assertWidth('pkR', data.pkR);
  assertWidth('prfWrappedSkR', data.prfWrappedSkR);
  assertWidth('keyWrapIv', data.keyWrapIv);
  assertWidth('hpkeEncapsulatedSecret', data.hpkeEncapsulatedSecret);
  assertWidth('hpkeSealedKb', data.hpkeSealedKb);

  const newWrap: NewPasskeyWrap = {
    uid: uuidTransformer.to(uid),
    credentialId: base64urlToBuffer(data.credentialId),
    version: ENVELOPE_VERSION,
    pkR: data.pkR,
    prfWrappedSkR: data.prfWrappedSkR,
    keyWrapIv: data.keyWrapIv,
    hpkeEncapsulatedSecret: data.hpkeEncapsulatedSecret,
    hpkeSealedKb: data.hpkeSealedKb,
    createdAt,
    updatedAt: createdAt,
  };

  await db.insertInto('passkeyWraps').values(newWrap).execute();
}

/**
 * Re-seal `kB` to the existing `pkR`.
 *
 * Only the two `hpke*` fields and `updatedAt` move. `PasskeyWrapUpdate` documents
 * that, but it constrains this local rather than `.set()` itself — the explicit
 * field list below is what actually keeps `skR`'s protection out of the update.
 *
 * @returns Number of rows updated — 0 when the credential has no wrap
 */
export async function updatePasskeyWrapSeal(
  db: AccountDatabase,
  uid: string,
  credentialId: string,
  data: PasskeyWrapSealUpdate,
  updatedAt: number
): Promise<number> {
  assertWidth('hpkeEncapsulatedSecret', data.hpkeEncapsulatedSecret);
  assertWidth('hpkeSealedKb', data.hpkeSealedKb);

  // Listed rather than spread: a spread would carry any extra runtime property
  // into the SET clause, and an unexpected `pkR` there would destroy the skR a
  // rotation is meant to leave alone. TypeScript alone will not catch that.
  const update: PasskeyWrapUpdate = {
    hpkeEncapsulatedSecret: data.hpkeEncapsulatedSecret,
    hpkeSealedKb: data.hpkeSealedKb,
    updatedAt,
  };

  const result = await db
    .updateTable('passkeyWraps')
    .set(update)
    .where('uid', '=', uuidTransformer.to(uid))
    .where('credentialId', '=', base64urlToBuffer(credentialId))
    .executeTakeFirst();

  return Number(result.numUpdatedRows);
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
