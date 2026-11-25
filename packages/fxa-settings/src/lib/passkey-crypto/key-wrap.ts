/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The cryptographic layer of the passkey `kB` wrapping scheme: derive a
 * per-wrap AES-256-GCM key from the passkey's PRF output, and wrap or unwrap
 * `kB` under it.
 *
 * Web Crypto for every cryptographic operation. Everything crosses the module
 * boundary as `Uint8Array`, so no `CryptoKey` escapes a function. `aad` is
 * opaque here; `envelope.ts` owns its construction and is the only thing that
 * should be producing it.
 */

import { assertByteLength, concat } from './assert';
import {
  KB_BYTES,
  KDF_SALT_BYTES,
  KEY_WRAP_AAD_LABEL,
  KEY_WRAP_IV_BYTES,
  KEY_WRAP_KDF_HASH,
  KEY_WRAP_KDF_INFO,
  PRF_OUT_BYTES,
  V1_SIZES,
} from './constants';

export type WrappedKb = {
  /**
   * HKDF salt, freshly random per wrap.
   */
  kdfSalt: Uint8Array;
  /**
   * AES-GCM nonce, freshly random per wrap; never reused.
   */
  keyWrapIv: Uint8Array;
  /**
   * AES-256-GCM ciphertext of `kB` with the tag appended.
   */
  wrappedKb: Uint8Array;
};

/**
 * Derives the AES-256-GCM wrap key from `prfOut`, non-extractable and scoped to
 * one usage so the caller can neither read it back nor reverse the operation.
 *
 * FROZEN FORMAT CONTRACT. HKDF rather than using `prfOut` as the key directly:
 * the PRF output is uniform, so this buys no entropy, but it scopes the key to
 * this one purpose. `prfOut` is deterministic per credential and salt, and if
 * that salt is ever evaluated for a second purpose the raw form would be the
 * same AES key in both places. The per-wrap `kdfSalt` gives every wrap its own
 * key, so a nonce collision across two wraps of the same credential cannot
 * pair two ciphertexts under one key.
 */
async function deriveWrapKey(
  prfOut: Uint8Array,
  kdfSalt: Uint8Array,
  usage: 'encrypt' | 'decrypt'
): Promise<CryptoKey> {
  assertByteLength('prfOut', prfOut, PRF_OUT_BYTES);
  assertByteLength('kdfSalt', kdfSalt, KDF_SALT_BYTES);
  const ikm = await crypto.subtle.importKey('raw', prfOut, 'HKDF', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: KEY_WRAP_KDF_HASH,
      salt: kdfSalt,
      info: KEY_WRAP_KDF_INFO,
    },
    ikm,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  );
}

/**
 * Wraps `kB` under the passkey's PRF output.
 *
 * The salt and nonce are generated here rather than accepted as parameters
 * because callers must not be able to cause reuse. A repeated nonce under a
 * repeated key collapses GCM's confidentiality *and* authenticity; the fresh
 * salt makes the key unique per wrap and the fresh nonce is a second guard.
 *
 * Uses the `getRandomValues` return value, not the in-place form: this package's
 * `setupTests.tsx` shim does not fill the array passed in, so in-place would
 * yield all-zero bytes in every test.
 */
export async function wrapKb(
  kB: Uint8Array,
  prfOut: Uint8Array,
  aad: Uint8Array
): Promise<WrappedKb> {
  assertByteLength('kB', kB, KB_BYTES);
  const kdfSalt = crypto.getRandomValues(new Uint8Array(KDF_SALT_BYTES));
  const key = await deriveWrapKey(prfOut, kdfSalt, 'encrypt');
  const keyWrapIv = crypto.getRandomValues(new Uint8Array(KEY_WRAP_IV_BYTES));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: keyWrapIv,
      additionalData: concat(KEY_WRAP_AAD_LABEL, aad),
    },
    key,
    kB
  );

  const wrappedKb = new Uint8Array(ciphertext);
  // Fires only if the tag length moved — caught here rather than as a padded,
  // permanently unopenable row.
  assertByteLength('wrappedKb', wrappedKb, V1_SIZES.wrappedKb);

  return { kdfSalt, keyWrapIv, wrappedKb };
}

/**
 * Unwraps `kB`.
 *
 * Throws if the ciphertext, salt, nonce, key, or AAD does not match the wrap.
 * GCM cannot distinguish those cases, so the error carries no detail about
 * which input was wrong.
 */
export async function unwrapKb(
  { kdfSalt, keyWrapIv, wrappedKb }: WrappedKb,
  prfOut: Uint8Array,
  aad: Uint8Array
): Promise<Uint8Array> {
  assertByteLength('keyWrapIv', keyWrapIv, KEY_WRAP_IV_BYTES);
  assertByteLength('wrappedKb', wrappedKb, V1_SIZES.wrappedKb);
  const key = await deriveWrapKey(prfOut, kdfSalt, 'decrypt');

  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: keyWrapIv,
      additionalData: concat(KEY_WRAP_AAD_LABEL, aad),
    },
    key,
    wrappedKb
  );

  return new Uint8Array(plaintext);
}
