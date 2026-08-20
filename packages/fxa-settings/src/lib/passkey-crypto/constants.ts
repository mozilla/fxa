/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Wire-format constants for the passkey `kB` wrapping envelope.
 *
 * FROZEN FORMAT CONTRACT. Every value here is baked into stored envelopes;
 * changing one locks users out of their sync data and requires a new envelope
 * version — see FXA-14155. The sizes will also be validated server-side and in
 * the `passkeyWraps` schema, so all three must move together.
 *
 * The ciphersuite lives in `suite.ts`, and each layer's domain-separation label
 * is module-local to the layer that applies it — both internal, since this file
 * is re-exported wholesale. `hpke.test.ts` pins the suite's registry ids.
 */

/**
 * HPKE mode 0, `mode_base` (tech spec §2.2.2): no PSK, no sender auth.
 */
export const HPKE_MODE_BASE = 0;

/**
 * Curve for the per-wrap recipient keypair.
 */
export const RECIPIENT_CURVE = 'P-521';

/**
 * Web Crypto algorithm name for the recipient keypair.
 */
export const RECIPIENT_ALGORITHM = 'ECDH';

/**
 * AES-GCM nonce length in bytes. Never reuse a nonce under this key — see
 * `wrapRecipientPrivateKey`.
 */
export const KEY_WRAP_IV_BYTES = 12;

/**
 * Length of the WebAuthn PRF output. `prfOut` must be exactly this long.
 *
 * It is HKDF input keying material, not the AES key itself — see
 * `derivePrfKey`.
 */
export const PRF_OUT_BYTES = 32;

/**
 * Hash for the HKDF that derives the `skR` wrap key from `prfOut`. Matches the
 * HPKE suite's KDF so there is one hash in the design, not two.
 */
export const KEY_WRAP_KDF_HASH = 'SHA-512';

/**
 * Length of a decoded `uid`. Matches `accounts.uid BINARY(16)`.
 */
export const UID_BYTES = 16;

/**
 * Length of `kB`. Any other length seals to the wrong width.
 */
export const KB_BYTES = 32;

/**
 * Byte lengths for the v1 ciphersuite. Tests assert these, so a library or
 * platform change fails here rather than writing envelopes the server rejects.
 */
export const V1_SIZES = {
  /**
   * Uncompressed P-521 point: 0x04 || x(66) || y(66).
   */
  pkR: 133,
  /**
   * RFC 9180 `Nsk`: the private-key scalar, big-endian.
   *
   * Not a PKCS#8 export. PKCS#8 is 241 bytes only because Web Crypto emits an
   * OPTIONAL public-key field that no spec requires; an implementation that
   * omitted it would be zero-padded into the fixed-width column and never open
   * again. Note the library's serialiser does not pad — it decodes the JWK `d`
   * as-is — so `generateRecipientKeyPair` fixes the width itself.
   */
  skRRaw: 66,
  /**
   * AES-256-GCM(raw skR scalar) + 16-byte tag.
   */
  prfWrappedSkR: 82,
  keyWrapIv: KEY_WRAP_IV_BYTES,
  /**
   * RFC 9180 `Nenc`: an uncompressed point.
   */
  hpkeEncapsulatedSecret: 133,
  /**
   * 32-byte kB + 16-byte tag.
   */
  hpkeSealedKb: 48,
} as const;
