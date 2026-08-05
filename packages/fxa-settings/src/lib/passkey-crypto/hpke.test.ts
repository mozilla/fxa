/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Real Web Crypto and the real `hpke` library throughout — no mocked
 * primitives. `setupTests.tsx` wires Node's `webcrypto.subtle` into the global.
 */

import { MODE_BASE } from 'hpke';
import { HPKE_MODE_BASE, V1_SIZES } from './constants';
import { getSuiteIds, openKb, sealKb } from './hpke';
import { generateRecipientKeyPair } from './key-wrap';
import { suite } from './suite';
import vectors from './rfc9180-a6-vectors.json';

const hex = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));

/**
 * Shorthand for the opaque `info`/`aad` byte strings these tests pass through.
 *
 * `setupTests.tsx` installs Node's `util.TextEncoder`, so its output is a
 * Uint8Array from Node's realm rather than jsdom's, and the library's
 * `instanceof Uint8Array` checks reject it. Re-wrapping with `Uint8Array.from`
 * puts the bytes in this realm. Browsers have a single realm, so production
 * callers passing `TextEncoder` output directly are fine — this is a
 * jsdom-only artifact.
 */
const bytes = (s: string) => Uint8Array.from(new TextEncoder().encode(s));

/** A 32-byte kB stand-in. Deterministic. */
const MOCK_KB = new Uint8Array(32).fill(0x5a);

const MOCK_INFO = bytes('fxa-passkey-wrap-v1');
const MOCK_OTHER_INFO = bytes('fxa-passkey-wrap-v2');
const MOCK_AAD = bytes('uid:credentialId');
const MOCK_OTHER_AAD = bytes('uid:otherCredentialId');

describe('passkey-crypto hpke', () => {
  describe('ciphersuite', () => {
    // RFC 9180 registry values. If a dependency upgrade changes the suite,
    // every stored envelope becomes un-openable, so pin them here.
    it('uses DHKEM(P-521, HKDF-SHA512) — KEM id 18', () => {
      expect(getSuiteIds().kem).toBe(18);
    });

    it('uses HKDF-SHA512 — KDF id 3', () => {
      expect(getSuiteIds().kdf).toBe(3);
    });

    it('uses AES-256-GCM — AEAD id 2', () => {
      expect(getSuiteIds().aead).toBe(2);
    });

    it('declares mode_base as 0, matching the library', () => {
      expect(HPKE_MODE_BASE).toBe(0);
      expect(MODE_BASE).toBe(0);
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

  describe('context binding', () => {
    it('fails to open when the aad differs', async () => {
      // Proves the envelope is bound to its credential context.
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

  // Guards the failure mode documented on openKb: where the library can derive
  // pkR it goes via crypto.subtle.getPublicKey, whose fallback needs an
  // extractable key. Node provides getPublicKey so the bug is invisible here
  // unless the method is actually removed — and it lives on the prototype, so
  // deleting it from the instance is a no-op.
  describe('runtimes without crypto.subtle.getPublicKey', () => {
    const subtleProto = Object.getPrototypeOf(crypto.subtle);
    const nativeGetPublicKey = subtleProto.getPublicKey;

    afterEach(() => {
      if (nativeGetPublicKey) {
        subtleProto.getPublicKey = nativeGetPublicKey;
      }
    });

    it('is removable from the prototype, so this suite is meaningful', () => {
      // If this fails, the deletion below is silently a no-op and the next
      // test proves nothing.
      delete subtleProto.getPublicKey;
      expect(typeof (crypto.subtle as any).getPublicKey).not.toBe('function');
    });

    it('still opens kB when getPublicKey is unavailable', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      const sealed = await sealKb(MOCK_KB, publicKey, MOCK_INFO, MOCK_AAD);

      delete subtleProto.getPublicKey;

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
   * RFC 9180 Appendix A.6 test vectors — DHKEM(P-521, HKDF-SHA512),
   * HKDF-SHA512, AES-256-GCM. These confirm the ciphersuite is configured
   * correctly, independently of our own envelope format.
   *
   * Distinct from the golden vectors in FXA-14269, which freeze *our* envelope.
   * These exercise the library against the standard's own published values, so
   * they are pinned by the RFC and must never be regenerated.
   */
  describe('RFC 9180 Appendix A.6 vectors', () => {
    it('matches the vector suite identifiers', () => {
      expect(vectors.mode).toBe(MODE_BASE);
      expect(getSuiteIds()).toEqual({
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

      for (const encryption of vectors.encryptions) {
        const pt = await ctx.Open(hex(encryption.ct), hex(encryption.aad));
        expect(Buffer.from(pt).toString('hex')).toBe(encryption.pt);
      }
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
