/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AEAD_AES_256_GCM,
  CipherSuite,
  KDF_HKDF_SHA512,
  KEM_DHKEM_P521_HKDF_SHA512,
} from 'hpke';

/**
 * The v1 HPKE ciphersuite: frozen configuration with exactly one correct
 * instance, in the same category as `constants.ts`.
 *
 * FROZEN FORMAT CONTRACT. Mode is `mode_base` (0) implicitly: no `psk`/`pskId`
 * is ever passed, and the sender key is ephemeral.
 *
 * Its own module because `index.ts` re-exports `constants.ts` wholesale, and
 * the suite must stay internal — it deals in `CryptoKey`s. Both `hpke.ts` and
 * `key-wrap.ts` consume it, so defining it in either would leave one importing
 * the other for a value neither owns. Deliberately not injectable: substituting
 * a suite would mean testing a format we do not ship.
 */
export const suite = new CipherSuite(
  KEM_DHKEM_P521_HKDF_SHA512,
  KDF_HKDF_SHA512,
  AEAD_AES_256_GCM
);

/**
 * ASCII only, so `charCodeAt` is exact.
 *
 * Not `TextEncoder`: jsdom runs test code in a separate JS realm from the one
 * its globals come from, and each realm has its own `Uint8Array` constructor.
 * A `TextEncoder` result therefore fails the `hpke` library's
 * `instanceof Uint8Array` guard even though the bytes are identical.
 * `Uint8Array.from` builds the array in this realm.
 */
const ascii = (text: string) => Uint8Array.from(text, (c) => c.charCodeAt(0));

/**
 * Domain-separation label, prefixed to the HPKE `info` in `hpke.ts`.
 *
 * FROZEN FORMAT CONTRACT. Not re-exported from `index.ts`, so a caller cannot
 * prefix it a second time.
 */
export const HPKE_INFO_LABEL = ascii('fxa-passkey-kb-wrap-v1');

/**
 * Domain-separation label, prefixed to the `skR` wrap's `aad` in `key-wrap.ts`.
 *
 * FROZEN FORMAT CONTRACT. Internal for the same reason as the HPKE label.
 */
export const KEY_WRAP_AAD_LABEL = ascii('fxa-passkey-skr-wrap-v1');

/**
 * HKDF `info` for deriving the `skR` wrap key from `prfOut`.
 *
 * FROZEN FORMAT CONTRACT. `prfOut` is not used as the AES key directly: it is
 * a credential-scoped secret with no domain separation of its own, so any
 * second use of the same PRF salt would share a key with this wrap. Deriving
 * costs one HKDF call and scopes the key to this purpose. Distinct from
 * `KEY_WRAP_AAD_LABEL` so the derived key and the AAD can never collide.
 */
export const KEY_WRAP_KDF_INFO = ascii('fxa-passkey-skr-wrap-key-v1');
