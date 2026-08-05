/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The v1 HPKE ciphersuite, shared by both layers of the envelope.
 *
 * FROZEN FORMAT CONTRACT — see FXA-14155. The suite is baked into every stored
 * envelope; changing it makes existing wraps un-openable.
 *
 * It lives here rather than in `hpke.ts` because `key-wrap.ts` needs it too,
 * for `SerializePrivateKey`, and the AES-GCM layer must not depend on the HPKE
 * layer above it. Not re-exported from `index.ts`: the suite deals in
 * `CryptoKey`s, and nothing outside this module should hold one.
 *
 * Built once — `CipherSuite` holds no per-message state, so a module-level
 * instance is safe and avoids re-deriving suite ids.
 *
 * Mode is `mode_base` (0) implicitly: no `psk`/`pskId` is ever passed, and
 * there is no sender to authenticate since the sender key is ephemeral.
 */

import {
  AEAD_AES_256_GCM,
  CipherSuite,
  KDF_HKDF_SHA512,
  KEM_DHKEM_P521_HKDF_SHA512,
} from 'hpke';

export const suite = new CipherSuite(
  KEM_DHKEM_P521_HKDF_SHA512,
  KDF_HKDF_SHA512,
  AEAD_AES_256_GCM
);
