/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The HPKE layer of the passkey `kB` wrapping scheme: seal `kB` to a recipient
 * public key, and open it again with the recipient private key.
 *
 * FROZEN FORMAT CONTRACT — see FXA-14155. The ciphersuite, mode, and the
 * `info`/`aad` a caller passes are all bound into the output, which is why the
 * `hpke` dependency is pinned exactly.
 *
 * Everything crosses the module boundary as `Uint8Array`. `info` and `aad` are
 * opaque here; `envelope.ts` owns their construction and is the only thing that
 * should be producing them.
 */

import { assertByteLength } from './assert';
import {
  KB_BYTES,
  RECIPIENT_ALGORITHM,
  RECIPIENT_CURVE,
  V1_SIZES,
} from './constants';
import { concat } from 'hpke';
import { HPKE_INFO_LABEL, suite } from './suite';

/** Base64url, no padding — the encoding JWK uses for EC coordinates. */
function b64u(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Rebuilds the recipient keypair for decapsulation.
 *
 * Deliberately not `suite.DeserializePrivateKey`. That path takes the scalar
 * alone, so it has to recover the public point by multiplying it against the
 * curve generator — a pure-JS BigInt wNAF multiply in the library, branching on
 * secret-derived digits, run on every unlock. We store `pkR`, so the point is
 * already known and Web Crypto can import the pair directly. Same key, none of
 * that code, and no dependence on `crypto.subtle.getPublicKey`.
 *
 * A `pkR` that does not match `skRRaw` is not a security problem: it only feeds
 * `kem_context`, so a mismatch derives the wrong secret and fails the AEAD.
 */
async function importRecipientKeyPair(pkR: Uint8Array, skRRaw: Uint8Array) {
  assertByteLength('pkR', pkR, V1_SIZES.pkR);
  assertByteLength('skRRaw', skRRaw, V1_SIZES.skRRaw);
  if (pkR[0] !== 0x04) {
    throw new Error('pkR must be an uncompressed point, tagged 0x04');
  }

  const coordinate = (V1_SIZES.pkR - 1) / 2;
  const [publicKey, privateKey] = await Promise.all([
    suite.DeserializePublicKey(pkR),
    crypto.subtle.importKey(
      'jwk',
      {
        kty: 'EC',
        crv: RECIPIENT_CURVE,
        x: b64u(pkR.subarray(1, 1 + coordinate)),
        y: b64u(pkR.subarray(1 + coordinate)),
        d: b64u(skRRaw),
      },
      { name: RECIPIENT_ALGORITHM, namedCurve: RECIPIENT_CURVE },
      // Non-extractable: nothing needs to read this back out.
      false,
      ['deriveBits']
    ),
  ]);

  return { publicKey, privateKey };
}

/**
 * A sealed `kB` and the encapsulated secret needed to open it.
 */
export type SealedKb = {
  /**
   * RFC 9180 `enc`: the ephemeral public key, stored alongside the wrap.
   */
  encapsulatedSecret: Uint8Array;
  /**
   * AES-256-GCM ciphertext of `kB`, with the tag appended.
   */
  ciphertext: Uint8Array;
};

/**
 * Seals `kB` to the recipient public key.
 *
 * A fresh ephemeral sender key is generated per call, so two seals of the same
 * `kB` to the same `pkR` differ — no nonce for the caller to manage here.
 */
export async function sealKb(
  kB: Uint8Array,
  pkR: Uint8Array,
  info: Uint8Array,
  aad: Uint8Array
): Promise<SealedKb> {
  assertByteLength('kB', kB, KB_BYTES);
  // DeserializePublicKey would reject a malformed point anyway, but a wrong
  // width here means a wrong width read back out of a fixed-length column, and
  // that should name the field rather than surface as a library error.
  assertByteLength('pkR', pkR, V1_SIZES.pkR);

  const recipientPublicKey = await suite.DeserializePublicKey(pkR);
  const { encapsulatedSecret, ciphertext } = await suite.Seal(
    recipientPublicKey,
    kB,
    { info: concat(HPKE_INFO_LABEL, info), aad }
  );

  // Both are ciphersuite constants, so this only fires if a library or platform
  // change moved them — before the wrong widths reach a BINARY column, where
  // they are silently padded and can never be opened again.
  assertByteLength(
    'hpkeEncapsulatedSecret',
    encapsulatedSecret,
    V1_SIZES.hpkeEncapsulatedSecret
  );
  assertByteLength('hpkeSealedKb', ciphertext, V1_SIZES.hpkeSealedKb);

  return { encapsulatedSecret, ciphertext };
}

/**
 * Opens a sealed `kB`.
 *
 * Takes `pkR` as well as the private key, deliberately. Decapsulation needs the
 * public key, and where the library derives one it uses
 * `crypto.subtle.getPublicKey`, whose fallback requires an extractable private
 * key — so a runtime without that method (WebKit at time of writing) fails with
 * a generic `DecapError`. Node has it, so the bug would pass CI and break only
 * in the browser. We store `pkR` anyway, so passing it costs nothing;
 * `hpke.test.ts` deletes the method from the prototype to hold this.
 *
 * Throws if anything fails to match what was used to seal, with no detail about
 * which input was wrong.
 */
export async function openKb(
  sealed: SealedKb,
  pkR: Uint8Array,
  skRRaw: Uint8Array,
  info: Uint8Array,
  aad: Uint8Array
): Promise<Uint8Array> {
  assertByteLength(
    'hpkeEncapsulatedSecret',
    sealed.encapsulatedSecret,
    V1_SIZES.hpkeEncapsulatedSecret
  );
  assertByteLength('hpkeSealedKb', sealed.ciphertext, V1_SIZES.hpkeSealedKb);

  return suite.Open(
    await importRecipientKeyPair(pkR, skRRaw),
    sealed.encapsulatedSecret,
    sealed.ciphertext,
    { info: concat(HPKE_INFO_LABEL, info), aad }
  );
}
