/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Wire-format constants for the passkey `kB` wrapping envelope.
 *
 * FROZEN FORMAT CONTRACT. Every value here is baked into stored envelopes;
 * changing one locks users out of their sync data and requires a new envelope
 * version — see `docs/adr/0053-passkey-wrap-format-stability.md`. The sizes
 * are also validated server-side and in the `passkeyWraps` schema, so all
 * three must move together.
 */

/**
 * ASCII only, so `charCodeAt` is exact.
 */
const ascii = (text: string) => Uint8Array.from(text, (c) => c.charCodeAt(0));

/**
 * HKDF `info` for deriving the AES-GCM key from `prfOut`.
 *
 * FROZEN FORMAT CONTRACT. `prfOut` is not used as the AES key directly: it is
 * a credential-scoped secret with no domain separation of its own, so any
 * second use of the same PRF salt would share a key with this wrap. Deriving
 * costs one HKDF call and scopes the key to this purpose. Distinct from
 * `KEY_WRAP_AAD_LABEL` so the derived key and the AAD can never collide.
 */
export const KEY_WRAP_KDF_INFO = ascii('fxa-passkey-kb-wrap-key-v1');

/**
 * Domain-separation label, prefixed to the AES-GCM `aad` in `key-wrap.ts`.
 *
 * FROZEN FORMAT CONTRACT. Not re-exported from `index.ts`, so a caller cannot
 * prefix it a second time.
 */
export const KEY_WRAP_AAD_LABEL = ascii('fxa-passkey-kb-wrap-aad-v1');

/**
 * Hash for the HKDF that derives the wrap key from `prfOut`.
 */
export const KEY_WRAP_KDF_HASH = 'SHA-512';

/**
 * HKDF salt length in bytes. Fresh per wrap, so the AES key differs on every
 * wrap even though `prfOut` is the same for a credential's lifetime.
 */
export const KDF_SALT_BYTES = 32;

/**
 * AES-GCM nonce length in bytes. Never reuse a nonce under this key — see
 * `wrapKb`.
 */
export const KEY_WRAP_IV_BYTES = 12;

/**
 * Length of the WebAuthn PRF output. `prfOut` must be exactly this long.
 *
 * It is HKDF input keying material, not the AES key itself — see
 * `deriveWrapKey`.
 */
export const PRF_OUT_BYTES = 32;

/**
 * Length of a decoded `uid`. Matches `accounts.uid BINARY(16)`.
 */
export const UID_BYTES = 16;

/**
 * Length of `kB`. Any other length wraps to the wrong width.
 */
export const KB_BYTES = 32;

/**
 * Largest decoded `credentialId` the wrap can be stored against. The WebAuthn
 * L2 ceiling, matching `passkeys.credentialId VARBINARY(1023)` and the route
 * validator. Anything longer wraps an envelope the server will not accept.
 */
export const CREDENTIAL_ID_MAX_BYTES = 1023;

/**
 * Byte lengths of the v1 envelope fields. Tests assert these, so a platform
 * change fails here rather than writing envelopes the server rejects.
 */
export const V1_SIZES = {
  kdfSalt: KDF_SALT_BYTES,
  keyWrapIv: KEY_WRAP_IV_BYTES,
  /**
   * 32-byte kB + 16-byte tag.
   */
  wrappedKb: KB_BYTES + 16,
} as const;
