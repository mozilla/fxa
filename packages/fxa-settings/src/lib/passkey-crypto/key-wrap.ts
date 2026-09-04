/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The AES-GCM layer of the passkey `kB` wrapping scheme: generate the per-wrap
 * recipient keypair, and wrap/unwrap its private key under the passkey's PRF
 * output.
 *
 * Web Crypto for every cryptographic operation. The one `hpke` import is
 * `SerializePrivateKey`, a serialiser only: Web Crypto cannot export a bare
 * scalar. It does not pad to `Nsk`, so this module left-pads the result.
 *
 * Everything crosses the module boundary as `Uint8Array`, so no `CryptoKey`
 * escapes a function. `aad` is opaque here; `envelope.ts` owns its construction
 * and is the only thing that should be producing it.
 */

import { assertByteLength } from './assert';
import { concat } from 'hpke';
import {
  KEY_WRAP_IV_BYTES,
  KEY_WRAP_KDF_HASH,
  PRF_OUT_BYTES,
  RECIPIENT_ALGORITHM,
  RECIPIENT_CURVE,
  V1_SIZES,
} from './constants';
import { KEY_WRAP_AAD_LABEL, KEY_WRAP_KDF_INFO, suite } from './suite';

export type RecipientKeyPair = {
  /**
   * Uncompressed P-521 public point, stored as `pkR`.
   */
  publicKey: Uint8Array;
  /**
   * Raw private-key scalar, wrapped under `prfOut` before storage.
   */
  privateKeyRaw: Uint8Array;
};

export type WrappedPrivateKey = {
  /**
   * AES-256-GCM ciphertext with the tag appended.
   */
  wrapped: Uint8Array;
  /**
   * Freshly random per wrap; never reused.
   */
  iv: Uint8Array;
};

/**
 * Generates the per-wrap recipient keypair and returns both halves serialised.
 *
 * A fresh pair per wrap keeps `skR` compromise scoped to one envelope, and
 * means no long-lived private key exists to protect.
 */
export async function generateRecipientKeyPair(): Promise<RecipientKeyPair> {
  const pair = await crypto.subtle.generateKey(
    { name: RECIPIENT_ALGORITHM, namedCurve: RECIPIENT_CURVE },
    // Extractable: both halves must be exported to be stored, and
    // SerializePrivateKey refuses a non-extractable key. Discarded on return.
    true,
    ['deriveBits']
  );

  const [publicKeyRaw, scalar] = await Promise.all([
    crypto.subtle.exportKey('raw', pair.publicKey),
    suite.SerializePrivateKey(pair.privateKey),
  ]);

  const publicKey = new Uint8Array(publicKeyRaw);
  assertByteLength('pkR', publicKey, V1_SIZES.pkR);
  if (scalar.length > V1_SIZES.skRRaw) {
    throw new Error(
      `skRRaw must be at most ${V1_SIZES.skRRaw} bytes, got ${scalar.length}`
    );
  }

  // Left-pad rather than trust the length. SerializePrivateKey decodes the JWK
  // `d` as-is, so a platform whose EC export strips leading zeros yields a short
  // scalar — roughly 1 P-521 key in 512. Stored short, the fixed-width column
  // right-pads it and the wrap can never be opened.
  const privateKeyRaw = new Uint8Array(V1_SIZES.skRRaw);
  privateKeyRaw.set(scalar, V1_SIZES.skRRaw - scalar.length);
  scalar.fill(0);

  return { publicKey, privateKeyRaw };
}

/**
 * Derives the AES-256-GCM wrap key from `prfOut`, non-extractable and scoped to
 * one usage so the caller can neither read it back nor reverse the operation.
 *
 * FROZEN FORMAT CONTRACT. HKDF rather than using `prfOut` as the key directly:
 * the PRF output is uniform, so this buys no entropy, but it scopes the key to
 * this one purpose. `prfOut` is deterministic per credential and salt, and if
 * that salt is ever evaluated for a second purpose the raw form would be the
 * same AES key in both places. The salt is empty by design — HKDF-Extract with
 * no salt is well defined, and there is nowhere to store a per-wrap one that an
 * attacker holding the envelope would not also hold.
 */
async function derivePrfKey(
  prfOut: Uint8Array,
  usage: 'encrypt' | 'decrypt'
): Promise<CryptoKey> {
  assertByteLength('prfOut', prfOut, PRF_OUT_BYTES);
  const ikm = await crypto.subtle.importKey('raw', prfOut, 'HKDF', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: KEY_WRAP_KDF_HASH,
      salt: new Uint8Array(0),
      info: KEY_WRAP_KDF_INFO,
    },
    ikm,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  );
}

/**
 * Wraps the recipient private key under the passkey's PRF output.
 *
 * The nonce is generated here rather than accepted as a parameter because
 * callers must not be able to cause reuse. `prfOut` is deterministic per
 * credential and salt, so the AES-GCM key is the *same key* on every wrap —
 * re-enrolment after a password reset wraps a new `skR` under it, and a
 * repeated nonce across those two collapses GCM's confidentiality *and*
 * authenticity. Never derive, cache, or reuse it.
 *
 * Uses the `getRandomValues` return value, not the in-place form: this package's
 * `setupTests.tsx` shim does not fill the array passed in, so in-place would
 * yield an all-zero nonce in every test.
 */
export async function wrapRecipientPrivateKey(
  privateKeyRaw: Uint8Array,
  prfOut: Uint8Array,
  aad: Uint8Array
): Promise<WrappedPrivateKey> {
  assertByteLength('skRRaw', privateKeyRaw, V1_SIZES.skRRaw);
  const key = await derivePrfKey(prfOut, 'encrypt');
  const iv = crypto.getRandomValues(new Uint8Array(KEY_WRAP_IV_BYTES));

  const wrapped = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: concat(KEY_WRAP_AAD_LABEL, aad) },
    key,
    privateKeyRaw
  );

  const prfWrappedSkR = new Uint8Array(wrapped);
  // Fires only if the tag length or scalar width moved — caught here rather
  // than as a padded, permanently unopenable row.
  assertByteLength('prfWrappedSkR', prfWrappedSkR, V1_SIZES.prfWrappedSkR);
  assertByteLength('keyWrapIv', iv, KEY_WRAP_IV_BYTES);

  return { wrapped: prfWrappedSkR, iv };
}

/**
 * Unwraps the recipient private key, returning the raw scalar bytes.
 *
 * Throws if the ciphertext, nonce, key, or AAD does not match the wrap. GCM
 * cannot distinguish those cases, so the error carries no detail about which
 * input was wrong.
 */
export async function unwrapRecipientPrivateKey(
  wrapped: Uint8Array,
  iv: Uint8Array,
  prfOut: Uint8Array,
  aad: Uint8Array
): Promise<Uint8Array> {
  assertByteLength('keyWrapIv', iv, KEY_WRAP_IV_BYTES);
  assertByteLength('prfWrappedSkR', wrapped, V1_SIZES.prfWrappedSkR);
  const key = await derivePrfKey(prfOut, 'decrypt');

  const privateKeyRaw = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData: concat(KEY_WRAP_AAD_LABEL, aad) },
    key,
    wrapped
  );

  const scalar = new Uint8Array(privateKeyRaw);
  assertByteLength('skRRaw', scalar, V1_SIZES.skRRaw);
  return scalar;
}
