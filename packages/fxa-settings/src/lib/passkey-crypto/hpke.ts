/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The HPKE layer of the passkey `kB` wrapping scheme: seal `kB` to a recipient
 * public key, and open it again with the recipient private key.
 *
 * FROZEN FORMAT CONTRACT — see FXA-14155. The ciphersuite, mode, and the
 * `info`/`aad` values a caller passes are all bound into the output. Changing
 * any of them makes stored envelopes un-openable, which locks users out of
 * their sync data. The `hpke` dependency is pinned to an exact version for the
 * same reason.
 *
 * Everything crosses the module boundary as `Uint8Array` — no `CryptoKey`
 * escapes a function. `info` and `aad` are opaque here: this layer neither
 * constructs nor interprets them. Building them from credential context
 * belongs to FXA-13147.
 */

import { suite } from './suite';

/** A sealed `kB` and the encapsulated secret needed to open it. */
export type SealedKb = {
  /** RFC 9180 `enc`: the ephemeral public key, stored alongside the wrap. */
  encapsulatedSecret: Uint8Array;
  /** AES-256-GCM ciphertext of `kB`, with the tag appended. */
  ciphertext: Uint8Array;
};

/**
 * Seals `kB` to the recipient public key.
 *
 * `pkR` is the uncompressed P-521 point produced by `generateRecipientKeyPair`.
 * A fresh ephemeral sender key is generated internally per call, so two seals
 * of the same `kB` to the same `pkR` produce different output — there is no
 * nonce for the caller to manage at this layer.
 */
export async function sealKb(
  kB: Uint8Array,
  pkR: Uint8Array,
  info: Uint8Array,
  aad: Uint8Array
): Promise<SealedKb> {
  const recipientPublicKey = await suite.DeserializePublicKey(pkR);
  const { encapsulatedSecret, ciphertext } = await suite.Seal(
    recipientPublicKey,
    kB,
    { info, aad }
  );
  return { encapsulatedSecret, ciphertext };
}

/**
 * Opens a sealed `kB`.
 *
 * Takes `pkR` as well as the private key, and this is deliberate rather than
 * redundant. RFC 9180 decapsulation needs the recipient public key to build
 * the KEM context, and the library will not infer it: passing a private key
 * alone is rejected outright. Where it can be inferred it goes via
 * `crypto.subtle.getPublicKey`, whose fallback *requires the private key to be
 * extractable* — so in a runtime without `getPublicKey` (WebKit at time of
 * writing) a non-extractable key fails, surfacing as a generic `DecapError`
 * rather than anything pointing at key handling. Node has `getPublicKey`, so
 * that combination passes in tests and CI and only breaks in the browser.
 *
 * Passing both halves avoids the derivation entirely. We store `pkR` anyway,
 * so this costs nothing and lets the private key stay non-extractable.
 * `hpke.test.ts` locks the behaviour in by deleting
 * `SubtleCrypto.prototype.getPublicKey` and asserting this still works.
 *
 * Throws if the ciphertext, encapsulated secret, key, `info`, or `aad` does not
 * match what was used to seal. These are indistinguishable by design, so the
 * error carries no detail about which input was wrong.
 */
export async function openKb(
  sealed: SealedKb,
  pkR: Uint8Array,
  skRRaw: Uint8Array,
  info: Uint8Array,
  aad: Uint8Array
): Promise<Uint8Array> {
  const [publicKey, privateKey] = await Promise.all([
    suite.DeserializePublicKey(pkR),
    // Non-extractable: nothing downstream needs to read these bytes back, and
    // the pkR we pass alongside means extractability is never required.
    suite.DeserializePrivateKey(skRRaw, false),
  ]);

  return suite.Open(
    { publicKey, privateKey },
    sealed.encapsulatedSecret,
    sealed.ciphertext,
    { info, aad }
  );
}

/**
 * The ciphersuite identifiers actually in use, for tests to assert against the
 * RFC 9180 registry. Exposed so a dependency upgrade that silently changed the
 * suite would fail loudly.
 */
export function getSuiteIds(): { kem: number; kdf: number; aead: number } {
  return { kem: suite.KEM.id, kdf: suite.KDF.id, aead: suite.AEAD.id };
}
