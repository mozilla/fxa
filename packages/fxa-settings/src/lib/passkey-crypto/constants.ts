/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Wire-format constants for the passkey `kB` wrapping envelope.
 *
 * FROZEN FORMAT CONTRACT. Every value here is baked into stored envelopes:
 * changing one makes existing wraps un-openable, locking users out of their
 * sync data. Changes require a new envelope version and a migration path —
 * see FXA-14155. The sizes below are also validated server-side (FXA-13142)
 * and sized in the `passkeyWraps` schema, so they must move together.
 */

/** HPKE ciphersuite: DHKEM(P-521, HKDF-SHA512) / HKDF-SHA512 / AES-256-GCM. */
export const HPKE_KEM = 'DHKEM-P521-HKDF-SHA512';
export const HPKE_KDF = 'HKDF-SHA512';
export const HPKE_AEAD = 'AES-256-GCM';

/**
 * HPKE mode 0, `mode_base` (tech spec §2.2.2): no pre-shared key and no
 * sender authentication. The sender is anonymous and ephemeral, so there is
 * no sender identity to authenticate.
 */
export const HPKE_MODE_BASE = 0;

/** Curve for the per-wrap recipient keypair. */
export const RECIPIENT_CURVE = 'P-521';

/** Web Crypto algorithm name for the recipient keypair. */
export const RECIPIENT_ALGORITHM = 'ECDH';

/**
 * AES-GCM nonce length in bytes, for wrapping `skR` under `prfOut`.
 *
 * 12 bytes is the only length GCM uses without extra derivation. Callers must
 * never reuse a nonce under this key — see `wrapRecipientPrivateKey`.
 */
export const KEY_WRAP_IV_BYTES = 12;

/** AES-256 key length in bytes. `prfOut` must be exactly this long. */
export const PRF_OUT_BYTES = 32;

/**
 * Expected byte lengths for the v1 ciphersuite. Measured, not estimated —
 * every field is fixed-length. Asserted in tests so a library or platform
 * change that shifts a size fails loudly here rather than silently writing
 * envelopes the server will reject.
 */
export const V1_SIZES = {
  /** Uncompressed P-521 point: 0x04 || x(66) || y(66). */
  pkR: 133,
  /**
   * RFC 9180 `Nsk` for DHKEM(P-521): the private-key scalar, big-endian.
   *
   * Deliberately not a PKCS#8 export. PKCS#8 measures 241 bytes only because
   * every Web Crypto implementation happens to emit the OPTIONAL public-key
   * field, which no spec requires — a conforming one that omitted it would be
   * zero-padded into the fixed-width column and never open again. 66 is a
   * ciphersuite constant and cannot drift. Serialisation is left to the
   * library, which pads short scalars to `Nsk`.
   */
  skRRaw: 66,
  /** AES-256-GCM(raw skR scalar) + 16-byte tag. */
  prfWrappedSkR: 82,
  keyWrapIv: KEY_WRAP_IV_BYTES,
  /** RFC 9180 Nenc for DHKEM(P-521): an uncompressed point. */
  hpkeEncapsulatedSecret: 133,
  /** 32-byte kB + 16-byte tag. */
  hpkeSealedKb: 48,
} as const;
