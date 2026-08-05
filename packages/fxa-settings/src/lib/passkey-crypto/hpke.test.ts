/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The real `hpke` library and real `crypto.subtle` — but Node's, not a
 * browser's. `setupTests.tsx` wires `webcrypto.subtle` into the global and
 * replaces `getRandomValues` with a shim that returns bytes instead of filling
 * the array it is handed.
 *
 * Platform differences are therefore invisible here, which is how a dependency
 * on Node's JWK export width went unnoticed. Anything platform-dependent is
 * either simulated (see the `getPublicKey` suite) or handled in the module
 * rather than assumed.
 */

import { concat, MODE_BASE } from 'hpke';
import { HPKE_MODE_BASE, V1_SIZES } from './constants';
import { openKb, sealKb } from './hpke';
import { generateRecipientKeyPair } from './key-wrap';
import { HPKE_INFO_LABEL, suite } from './suite';
import vectors from './rfc9180-a6-vectors.json';

const hex = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));
// The `Uint8Array.from` is not redundant: jsdom's TextEncoder returns an array
// from another realm, which the library's `instanceof Uint8Array` check rejects.
const bytes = (s: string) => Uint8Array.from(new TextEncoder().encode(s));

const MOCK_KB = new Uint8Array(32).fill(0x5a);

const MOCK_INFO = bytes('fxa-passkey-wrap-v1');
const MOCK_OTHER_INFO = bytes('fxa-passkey-wrap-v2');
const MOCK_AAD = bytes('uid:credentialId');
const MOCK_OTHER_AAD = bytes('uid:otherCredentialId');

describe('passkey-crypto hpke', () => {
  describe('ciphersuite', () => {
    // Pinned: a dependency upgrade that changed the suite would make every
    // stored envelope un-openable.
    it('uses DHKEM(P-521, HKDF-SHA512) — KEM id 18', () => {
      expect(suite.KEM.id).toBe(18);
    });

    it('uses HKDF-SHA512 — KDF id 3', () => {
      expect(suite.KDF.id).toBe(3);
    });

    it('uses AES-256-GCM — AEAD id 2', () => {
      expect(suite.AEAD.id).toBe(2);
    });

    it('declares mode_base as 0, matching the library', () => {
      // Absolute, because HPKE_MODE_BASE has no production reader: it exists as
      // the frozen value the server and passkeyWraps schema must agree with.
      expect(HPKE_MODE_BASE).toBe(0);
      expect(HPKE_MODE_BASE).toBe(MODE_BASE);
    });

    // mode_base is implicit in never passing a psk, so assert it behaviourally:
    // comparing constants would still pass if sealKb started using mode_psk.
    //
    // Both cases use the production info — label included — so the psk is the
    // only difference between them. Passing bare MOCK_INFO would fail on the
    // info mismatch instead, and would pass whatever mode sealKb used.
    const productionInfo = () => concat(HPKE_INFO_LABEL, MOCK_INFO);

    const recipientKeys = async (
      publicKey: Uint8Array,
      skRRaw: Uint8Array
    ) => ({
      publicKey: await suite.DeserializePublicKey(publicKey),
      privateKey: await suite.DeserializePrivateKey(skRRaw, false),
    });

    it('opens in mode_base with the production info — the control', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      const ctx = await suite.SetupRecipient(
        await recipientKeys(publicKey, privateKeyRaw),
        sealed.encapsulatedSecret,
        { info: productionInfo() }
      );

      const opened = await ctx.Open(sealed.ciphertext, MOCK_AAD);
      expect(Buffer.from(opened)).toEqual(Buffer.from(MOCK_KB));
    });

    it('seals in mode_base, so a mode_psk recipient cannot open it', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      const ctx = await suite.SetupRecipient(
        await recipientKeys(publicKey, privateKeyRaw),
        sealed.encapsulatedSecret,
        {
          info: productionInfo(),
          psk: new Uint8Array(32).fill(0x11),
          pskId: bytes('psk-id'),
        }
      );

      await expect(ctx.Open(sealed.ciphertext, MOCK_AAD)).rejects.toThrow();
    });
  });

  describe('sealKb / openKb round-trip', () => {
    it('opens to the original kB', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      const opened = await openKb(
        sealed,
        publicKey,
        privateKeyRaw,
        MOCK_INFO,
        MOCK_AAD
      );

      expect(Buffer.from(opened)).toEqual(Buffer.from(MOCK_KB));
    });

    it('produces an encapsulated secret of the v1 size', async () => {
      const { publicKey } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);
      expect(sealed.encapsulatedSecret.length).toBe(
        V1_SIZES.hpkeEncapsulatedSecret
      );
    });

    it('produces a ciphertext of the v1 size', async () => {
      const { publicKey } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);
      expect(sealed.ciphertext.length).toBe(V1_SIZES.hpkeSealedKb);
    });

    it('throws when kB is not 32 bytes', async () => {
      // Unguarded, this seals to the wrong width and only fails server-side.
      const { publicKey } = await generateRecipientKeyPair();

      await expect(
        sealKb(new Uint8Array(16).fill(0x5a), publicKey, MOCK_INFO, MOCK_AAD)
      ).rejects.toThrow('kB must be 32 bytes, got 16');
    });

    // sealKb skips a pkR guard on the grounds that DeserializePublicKey rejects
    // malformed points. These pin that claim.
    it.each([
      { label: 'one byte short', pkR: new Uint8Array(132).fill(0x04) },
      { label: 'one byte long', pkR: new Uint8Array(134).fill(0x04) },
      { label: 'all zeros', pkR: new Uint8Array(133) },
      {
        label: 'a compressed point',
        pkR: Uint8Array.from([0x02, ...new Uint8Array(66).fill(0xa3)]),
      },
    ])('rejects a pkR that is $label', async ({ pkR }) => {
      await expect(sealKb(MOCK_KB, pkR, MOCK_INFO, MOCK_AAD)).rejects.toThrow();
    });

    it('rejects a pkR whose coordinates are not on the curve', async () => {
      const { publicKey } = await generateRecipientKeyPair();
      const offCurve = new Uint8Array(publicKey);
      offCurve[1] ^= 0xff;

      await expect(
        sealKb(MOCK_KB, offCurve, MOCK_INFO, MOCK_AAD)
      ).rejects.toThrow('Public key deserialization failed');
    });

    it('produces different output for identical inputs, via the ephemeral sender key', async () => {
      const { publicKey } = await generateRecipientKeyPair();
      const first = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);
      const second = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      expect(Buffer.from(first.encapsulatedSecret)).not.toEqual(
        Buffer.from(second.encapsulatedSecret)
      );
      expect(Buffer.from(first.ciphertext)).not.toEqual(
        Buffer.from(second.ciphertext)
      );
    });
  });

  describe('domain separation', () => {
    // The label is prefixed inside sealKb, so an implementation that used the
    // caller's info verbatim would produce a different, mutually un-openable
    // envelope. Opening with the bare info must therefore fail.
    it('binds a label into info that the caller does not supply', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      await expect(
        suite.Open(
          {
            publicKey: await suite.DeserializePublicKey(publicKey),
            privateKey: await suite.DeserializePrivateKey(privateKeyRaw, false),
          },
          sealed.encapsulatedSecret,
          sealed.ciphertext,
          { info: MOCK_INFO, aad: MOCK_AAD }
        )
      ).rejects.toThrow();
    });
  });

  describe('context binding', () => {
    it('fails to open when the aad differs', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      await expect(
        openKb(sealed, publicKey, privateKeyRaw, MOCK_INFO, MOCK_OTHER_AAD)
      ).rejects.toThrow();
    });

    it('fails to open when the info differs', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      await expect(
        openKb(sealed, publicKey, privateKeyRaw, MOCK_OTHER_INFO, MOCK_AAD)
      ).rejects.toThrow();
    });

    it('fails to open with a different recipient keypair', async () => {
      const intended = await generateRecipientKeyPair();
      const other = await generateRecipientKeyPair();
      const sealed = await sealKb(
        MOCK_KB,
        intended.publicKey,
        MOCK_INFO,
        MOCK_AAD
      );

      await expect(
        openKb(
          sealed,
          other.publicKey,
          other.privateKeyRaw,
          MOCK_INFO,
          MOCK_AAD
        )
      ).rejects.toThrow();
    });

    it('fails to open when the ciphertext is corrupted', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      const ciphertext = new Uint8Array(sealed.ciphertext);
      ciphertext[0] ^= 0xff;

      await expect(
        openKb(
          { ...sealed, ciphertext },
          publicKey,
          privateKeyRaw,
          MOCK_INFO,
          MOCK_AAD
        )
      ).rejects.toThrow();
    });

    it.each([
      { label: 'one byte short', delta: -1 },
      { label: 'one byte long', delta: 1 },
    ])(
      'fails to open when the encapsulated secret is $label',
      async ({ delta }) => {
        const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
        const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

        const encapsulatedSecret = new Uint8Array(
          V1_SIZES.hpkeEncapsulatedSecret + delta
        );
        encapsulatedSecret.set(
          sealed.encapsulatedSecret.subarray(0, encapsulatedSecret.length)
        );

        await expect(
          openKb(
            { ...sealed, encapsulatedSecret },
            publicKey,
            privateKeyRaw,
            MOCK_INFO,
            MOCK_AAD
          )
        ).rejects.toThrow('hpkeEncapsulatedSecret must be 133 bytes');
      }
    );

    it('fails to open when the ciphertext is truncated below the tag', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      await expect(
        openKb(
          { ...sealed, ciphertext: sealed.ciphertext.subarray(0, 15) },
          publicKey,
          privateKeyRaw,
          MOCK_INFO,
          MOCK_AAD
        )
      ).rejects.toThrow('hpkeSealedKb must be 48 bytes');
    });

    // Not guarded in openKb: DeserializePrivateKey rejects a wrong-width scalar.
    it.each([65, 67])('fails to open when skR is %i bytes', async (length) => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      const wrongLength = new Uint8Array(length);
      wrongLength.set(
        privateKeyRaw.subarray(0, Math.min(length, V1_SIZES.skRRaw))
      );

      await expect(
        openKb(sealed, publicKey, wrongLength, MOCK_INFO, MOCK_AAD)
      ).rejects.toThrow();
    });

    it('fails to open when the encapsulated secret is corrupted', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      const encapsulatedSecret = new Uint8Array(sealed.encapsulatedSecret);
      // Corrupt a coordinate byte, not the 0x04 point tag, so it stays a
      // well-formed point encoding and fails at decapsulation.
      encapsulatedSecret[1] ^= 0xff;

      await expect(
        openKb(
          { ...sealed, encapsulatedSecret },
          publicKey,
          privateKeyRaw,
          MOCK_INFO,
          MOCK_AAD
        )
      ).rejects.toThrow();
    });
  });

  // Guards the failure mode documented on openKb. Node provides getPublicKey, so
  // the bug is invisible unless the method is removed — and it lives on the
  // prototype, so deleting it from the instance is a no-op.
  describe('recipient key import', () => {
    // Item 3: openKb rebuilds the keypair from pkR + skRRaw itself rather than
    // calling DeserializePrivateKey, which recovers the public point with a
    // pure-JS BigInt scalar multiply over the secret on every unlock.
    it('never calls DeserializePrivateKey during open', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);
      const spy = jest.spyOn(suite, 'DeserializePrivateKey');

      try {
        await openKb(sealed, publicKey, privateKeyRaw, MOCK_INFO, MOCK_AAD);
        expect(spy).not.toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    });

    it('imports a key that derives the same bits as the library path', async () => {
      // The equivalence that makes the swap safe: same scalar, same ECDH.
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const peer = await generateRecipientKeyPair();
      // The library types its keys as `Key` — a CryptoKey without `usages`.
      const asCryptoKey = (key: unknown) => key as CryptoKey;
      const peerPublic = asCryptoKey(
        await suite.DeserializePublicKey(peer.publicKey)
      );

      const viaLibrary = await suite.DeserializePrivateKey(
        privateKeyRaw,
        false
      );
      const coordinate = (V1_SIZES.pkR - 1) / 2;
      const b64u = (bytes: Uint8Array) =>
        Buffer.from(bytes).toString('base64url');
      const viaJwk = await crypto.subtle.importKey(
        'jwk',
        {
          kty: 'EC',
          crv: 'P-521',
          x: b64u(publicKey.subarray(1, 1 + coordinate)),
          y: b64u(publicKey.subarray(1 + coordinate)),
          d: b64u(privateKeyRaw),
        },
        { name: 'ECDH', namedCurve: 'P-521' },
        false,
        ['deriveBits']
      );

      const derive = (key: CryptoKey) =>
        crypto.subtle.deriveBits(
          { name: 'ECDH', public: peerPublic },
          key,
          528
        );

      expect(Buffer.from(await derive(viaJwk))).toEqual(
        Buffer.from(await derive(asCryptoKey(viaLibrary)))
      );
    });

    it('opens a scalar with a leading zero byte', async () => {
      // Roughly 1 P-521 key in 512. The JWK d is fixed-width, so the zero must
      // survive the round trip rather than being stripped.
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const padded = Uint8Array.from(privateKeyRaw);
      padded[0] = 0x00;

      const pair = await suite.DeserializePrivateKey(padded, true);
      const jwk = await crypto.subtle.exportKey('jwk', pair as CryptoKey);
      const pkR = new Uint8Array(
        await crypto.subtle.exportKey(
          'raw',
          await crypto.subtle.importKey(
            'jwk',
            { kty: 'EC', crv: 'P-521', x: jwk.x, y: jwk.y },
            { name: 'ECDH', namedCurve: 'P-521' },
            true,
            []
          )
        )
      );
      const sealed = await sealKb(MOCK_KB, pkR, MOCK_INFO, MOCK_AAD);

      const opened = await openKb(sealed, pkR, padded, MOCK_INFO, MOCK_AAD);
      expect(Buffer.from(opened)).toEqual(Buffer.from(MOCK_KB));
    });

    it.each([
      ['too short', V1_SIZES.pkR - 1],
      ['too long', V1_SIZES.pkR + 1],
    ])('rejects a pkR that is %s, naming the field', async (_label, length) => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      await expect(
        openKb(
          sealed,
          new Uint8Array(length),
          privateKeyRaw,
          MOCK_INFO,
          MOCK_AAD
        )
      ).rejects.toThrow(`pkR must be ${V1_SIZES.pkR} bytes, got ${length}`);
    });

    it('rejects a pkR that is not an uncompressed point', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);
      const compressed = Uint8Array.from(publicKey);
      compressed[0] = 0x02;

      await expect(
        openKb(sealed, compressed, privateKeyRaw, MOCK_INFO, MOCK_AAD)
      ).rejects.toThrow(/uncompressed point/);
    });

    it('rejects a wrong-width pkR at seal time, naming the field', async () => {
      await expect(
        sealKb(MOCK_KB, new Uint8Array(64), MOCK_INFO, MOCK_AAD)
      ).rejects.toThrow(`pkR must be ${V1_SIZES.pkR} bytes, got 64`);
    });
  });

  describe('runtimes without crypto.subtle.getPublicKey', () => {
    type SubtleWithGetPublicKey = SubtleCrypto & {
      getPublicKey?: (key: CryptoKey, usages: KeyUsage[]) => Promise<CryptoKey>;
    };
    const subtleProto = Object.getPrototypeOf(
      crypto.subtle
    ) as SubtleWithGetPublicKey;
    const nativeGetPublicKey = subtleProto.getPublicKey;
    // Restore the descriptor, not just the value: SubtleCrypto.prototype is
    // shared across test files in this Jest worker, and a plain assignment
    // would leave an enumerable own property behind.
    const nativeDescriptor = Object.getOwnPropertyDescriptor(
      subtleProto,
      'getPublicKey'
    );

    afterEach(() => {
      // Delete first: the spy test installs an own property, which must go even
      // when there is no descriptor to put back.
      delete subtleProto.getPublicKey;
      if (nativeDescriptor) {
        Object.defineProperty(subtleProto, 'getPublicKey', nativeDescriptor);
      }
    });

    it('has getPublicKey to begin with, so this suite is meaningful', () => {
      // Without this, a runtime lacking the method entirely would let every test
      // below pass while proving nothing.
      expect(typeof nativeGetPublicKey).toBe('function');
    });

    it('is removable from the prototype', () => {
      delete subtleProto.getPublicKey;
      // Asserted on the instance, since that is what the library reaches
      // through; the prototype trivially lacks what was just deleted from it.
      expect(
        (crypto.subtle as SubtleWithGetPublicKey).getPublicKey
      ).toBeUndefined();
    });

    it('still seals and opens kB when getPublicKey is unavailable', async () => {
      // Delete before sealing: a seal-side break blocks enrolment entirely for
      // everyone on that browser, so the whole round trip has to run without it.
      delete subtleProto.getPublicKey;

      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      const opened = await openKb(
        sealed,
        publicKey,
        privateKeyRaw,
        MOCK_INFO,
        MOCK_AAD
      );
      expect(Buffer.from(opened)).toEqual(Buffer.from(MOCK_KB));
    });

    it('never calls getPublicKey during open', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      const spy = jest.fn(nativeGetPublicKey);
      subtleProto.getPublicKey = spy;

      await openKb(sealed, publicKey, privateKeyRaw, MOCK_INFO, MOCK_AAD);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  /**
   * RFC 9180 Appendix A.6 vectors: the ciphersuite is configured correctly,
   * independently of our envelope format. Pinned by the RFC — never regenerate
   * them. FXA-14269's golden vectors freeze *our* format instead.
   */
  describe('RFC 9180 Appendix A.6 vectors', () => {
    it('matches the vector suite identifiers', () => {
      expect(vectors.mode).toBe(MODE_BASE);
      expect({
        kem: suite.KEM.id,
        kdf: suite.KDF.id,
        aead: suite.AEAD.id,
      }).toEqual({
        kem: vectors.kem_id,
        kdf: vectors.kdf_id,
        aead: vectors.aead_id,
      });
    });

    it('re-serializes the vector pkRm unchanged', async () => {
      const publicKey = await suite.DeserializePublicKey(hex(vectors.pkRm));
      const reserialized = await suite.SerializePublicKey(publicKey);
      expect(Buffer.from(reserialized).toString('hex')).toBe(vectors.pkRm);
    });

    // One context opened across the contiguous sequence, since a
    // RecipientContext advances one sequence number per Open.
    it('decrypts the vector ciphertexts to the vector plaintexts', async () => {
      const privateKey = await suite.DeserializePrivateKey(
        hex(vectors.skRm),
        true
      );
      const publicKey = await suite.DeserializePublicKey(hex(vectors.pkRm));

      const ctx = await suite.SetupRecipient(
        { publicKey, privateKey },
        hex(vectors.enc),
        { info: hex(vectors.info) }
      );

      const opened: string[] = [];
      for (const encryption of vectors.encryptions) {
        const pt = await ctx.Open(hex(encryption.ct), hex(encryption.aad));
        opened.push(Buffer.from(pt).toString('hex'));
      }

      expect(opened).toEqual(vectors.encryptions.map((e) => e.pt));
    });

    it('rejects a vector ciphertext under a different info', async () => {
      const privateKey = await suite.DeserializePrivateKey(
        hex(vectors.skRm),
        true
      );
      const publicKey = await suite.DeserializePublicKey(hex(vectors.pkRm));

      const ctx = await suite.SetupRecipient(
        { publicKey, privateKey },
        hex(vectors.enc),
        { info: hex('00') }
      );

      await expect(
        ctx.Open(
          hex(vectors.encryptions[0].ct),
          hex(vectors.encryptions[0].aad)
        )
      ).rejects.toThrow();
    });
  });
});
