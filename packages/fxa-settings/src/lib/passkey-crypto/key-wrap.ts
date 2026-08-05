/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The AES-GCM layer of the passkey `kB` wrapping scheme: generate the per-wrap
 * recipient keypair, and wrap/unwrap its private key under the passkey's PRF
 * output.
 *
 * Web Crypto for every cryptographic operation. The one `hpke` import is
 * `SerializePrivateKey`, used purely as a serialiser: Web Crypto cannot export
 * a bare private-key scalar, and hand-rolling one from a JWK risks mis-padding
 * it — see `V1_SIZES.skRRaw`.
 *
 * Everything crosses the module boundary as `Uint8Array` — no `CryptoKey`
 * escapes a function, so callers can't accidentally retain or re-export key
 * material.
 *
 * `aad` is opaque here: these primitives neither construct nor interpret it.
 * Building the AAD from credential context belongs to FXA-13147.
 */

import {
  KEY_WRAP_IV_BYTES,
  PRF_OUT_BYTES,
  RECIPIENT_ALGORITHM,
  RECIPIENT_CURVE,
} from './constants';
import { suite } from './suite';

/** A freshly generated recipient keypair, already serialised. */
export type RecipientKeyPair = {
  /** Uncompressed P-521 public point, stored as `pkR`. */
  publicKey: Uint8Array;
  /** Raw private-key scalar, wrapped under `prfOut` before it is stored. */
  privateKeyRaw: Uint8Array;
};

/** A wrapped private key together with the nonce needed to unwrap it. */
export type WrappedPrivateKey = {
  /** AES-256-GCM ciphertext with the tag appended. */
  wrapped: Uint8Array;
  /** The nonce used for this wrap. Freshly random; never reused. */
  iv: Uint8Array;
};

/**
 * Generates the per-wrap recipient keypair and returns both halves serialised.
 *
 * A fresh pair per wrap is deliberate: it keeps `skR` compromise scoped to a
 * single envelope, and means no long-lived private key exists to protect.
 */
export async function generateRecipientKeyPair(): Promise<RecipientKeyPair> {
  const pair = await crypto.subtle.generateKey(
    { name: RECIPIENT_ALGORITHM, namedCurve: RECIPIENT_CURVE },
    // Extractable: both halves must be exported to be stored, and
    // SerializePrivateKey refuses a non-extractable key. The CryptoKey objects
    // are discarded before this function returns.
    true,
    ['deriveBits']
  );

  const [publicKey, privateKeyRaw] = await Promise.all([
    crypto.subtle.exportKey('raw', pair.publicKey),
    suite.SerializePrivateKey(pair.privateKey),
  ]);

  return {
    publicKey: new Uint8Array(publicKey),
    privateKeyRaw,
  };
}

/**
 * Imports `prfOut` as an AES-256-GCM key.
 *
 * Non-extractable, and scoped to a single usage, so the caller can never read
 * the PRF output back out of the key or use it for the opposite operation.
 */
async function importPrfKey(
  prfOut: Uint8Array,
  usage: 'encrypt' | 'decrypt'
): Promise<CryptoKey> {
  if (prfOut.length !== PRF_OUT_BYTES) {
    throw new Error(
      `prfOut must be ${PRF_OUT_BYTES} bytes, got ${prfOut.length}`
    );
  }
  return crypto.subtle.importKey('raw', prfOut, 'AES-GCM', false, [usage]);
}

/**
 * Wraps the recipient private key under the passkey's PRF output.
 *
 * The nonce is generated fresh here and returned, rather than accepted as a
 * parameter, because nonce reuse under this key is catastrophic and callers
 * must not be able to cause it. `prfOut` is deterministic for a given
 * credential and salt, so the AES-GCM key is the *same key* every time that
 * credential wraps anything — re-enrolment after a password reset wraps a new
 * `skR` under it. Reusing a 12-byte nonce across two such wraps collapses
 * GCM's confidentiality *and* authenticity guarantees at once. Never derive,
 * cache, or reuse it.
 *
 * Note the `getRandomValues` return value is used rather than the in-place
 * form. Both are correct against real Web Crypto, but the return value is the
 * repo convention (see `fxa-auth-client/lib/crypto.ts`) and it is the only form
 * that works under this package's test shim: `setupTests.tsx` defines
 * `getRandomValues` as returning fresh bytes without filling the array it is
 * passed, so the in-place form would silently yield an all-zero nonce in every
 * test. `key-wrap.test.ts` asserts against that.
 */
export async function wrapRecipientPrivateKey(
  privateKeyRaw: Uint8Array,
  prfOut: Uint8Array,
  aad: Uint8Array
): Promise<WrappedPrivateKey> {
  const key = await importPrfKey(prfOut, 'encrypt');
  const iv = crypto.getRandomValues(new Uint8Array(KEY_WRAP_IV_BYTES));

  const wrapped = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: aad },
    key,
    privateKeyRaw
  );

  return { wrapped: new Uint8Array(wrapped), iv };
}

/**
 * Unwraps the recipient private key, returning the raw scalar bytes.
 *
 * Throws if the ciphertext, nonce, key, or AAD does not match what was used to
 * wrap — GCM authentication failure is indistinguishable between those cases
 * by design, so the error deliberately carries no detail about which input was
 * wrong.
 */
export async function unwrapRecipientPrivateKey(
  wrapped: Uint8Array,
  iv: Uint8Array,
  prfOut: Uint8Array,
  aad: Uint8Array
): Promise<Uint8Array> {
  if (iv.length !== KEY_WRAP_IV_BYTES) {
    throw new Error(
      `keyWrapIv must be ${KEY_WRAP_IV_BYTES} bytes, got ${iv.length}`
    );
  }
  const key = await importPrfKey(prfOut, 'decrypt');

  const privateKeyRaw = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData: aad },
    key,
    wrapped
  );

  return new Uint8Array(privateKeyRaw);
}
