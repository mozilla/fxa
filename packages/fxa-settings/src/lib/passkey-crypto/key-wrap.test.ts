/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Real Web Crypto throughout — no mocked primitives. `setupTests.tsx` wires
 * Node's `webcrypto.subtle` into the global, so these exercise the same
 * algorithms the browser will.
 */

import { KEY_WRAP_IV_BYTES, PRF_OUT_BYTES, V1_SIZES } from './constants';
import {
  generateRecipientKeyPair,
  unwrapRecipientPrivateKey,
  wrapRecipientPrivateKey,
} from './key-wrap';
import { suite } from './suite';

/** Deterministic stand-in for a PRF output: 32 bytes of 0xa1. */
const MOCK_PRF_OUT = new Uint8Array(PRF_OUT_BYTES).fill(0xa1);
/** A different, equally deterministic PRF output. */
const MOCK_OTHER_PRF_OUT = new Uint8Array(PRF_OUT_BYTES).fill(0xb2);

/** Opaque AAD — this layer never constructs or interprets it (FXA-13147 does). */
const MOCK_AAD = new TextEncoder().encode('uid:credentialId:v1');
const MOCK_OTHER_AAD = new TextEncoder().encode('uid:otherCredentialId:v1');

describe('passkey-crypto key-wrap', () => {
  describe('generateRecipientKeyPair', () => {
    it('returns a public key of the v1 pkR size', async () => {
      const { publicKey } = await generateRecipientKeyPair();
      expect(publicKey).toBeInstanceOf(Uint8Array);
      expect(publicKey.length).toBe(V1_SIZES.pkR);
    });

    it('returns a raw private-key scalar of the v1 size', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      expect(privateKeyRaw).toBeInstanceOf(Uint8Array);
      expect(privateKeyRaw.length).toBe(V1_SIZES.skRRaw);
    });

    it('returns an uncompressed EC point, tagged 0x04', async () => {
      const { publicKey } = await generateRecipientKeyPair();
      expect(publicKey[0]).toBe(0x04);
    });

    it('generates a distinct keypair per call', async () => {
      const first = await generateRecipientKeyPair();
      const second = await generateRecipientKeyPair();
      expect(Buffer.from(first.publicKey)).not.toEqual(
        Buffer.from(second.publicKey)
      );
      expect(Buffer.from(first.privateKeyRaw)).not.toEqual(
        Buffer.from(second.privateKeyRaw)
      );
    });

    it('produces a private key the ciphersuite can re-import for ECDH', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      // Proves the exported bytes are a valid P-521 ECDH key, not just
      // the right length.
      const reimported = await suite.DeserializePrivateKey(
        privateKeyRaw,
        false
      );
      expect(reimported.type).toBe('private');
      expect(reimported.algorithm).toEqual(
        expect.objectContaining({ name: 'ECDH', namedCurve: 'P-521' })
      );
    });
  });

  /**
   * The fixed-width `prfWrappedSkR` column depends on `skR` always serialising
   * to exactly `Nsk` bytes, so the library — not us — owns the left-padding.
   * P-521 scalars below 2^512 carry a leading zero byte, roughly 1 key in 512,
   * and an implementation that stripped it would produce a short wrap that the
   * column silently zero-pads and can never open again.
   */
  describe('skR scalar serialisation', () => {
    /** A valid P-521 scalar small enough to need two bytes of left padding. */
    const LEADING_ZERO_SCALAR = '0000' + 'a3'.repeat(64);

    it('left-pads a leading-zero scalar to the v1 size', async () => {
      const key = await suite.DeserializePrivateKey(
        Uint8Array.from(Buffer.from(LEADING_ZERO_SCALAR, 'hex')),
        true
      );

      const reserialized = await suite.SerializePrivateKey(key);

      expect(reserialized.length).toBe(V1_SIZES.skRRaw);
      expect(Buffer.from(reserialized).toString('hex')).toBe(
        LEADING_ZERO_SCALAR
      );
    });
  });

  describe('wrapRecipientPrivateKey', () => {
    it('produces a wrapped key of the v1 prfWrappedSkR size', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );
      expect(wrapped.length).toBe(V1_SIZES.prfWrappedSkR);
    });

    it('produces an iv of the v1 keyWrapIv size', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );
      expect(iv.length).toBe(KEY_WRAP_IV_BYTES);
    });

    // The AC that guards the nonce-reuse failure mode: prfOut is deterministic
    // per credential, so the AES-GCM key repeats across re-enrolments. A
    // repeated iv under that key would collapse GCM's guarantees.
    it('uses a fresh iv when wrapping the same skR under the same prfOut twice', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const first = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );
      const second = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );
      expect(Buffer.from(first.iv)).not.toEqual(Buffer.from(second.iv));
    });

    it('produces different ciphertext for identical inputs, via the fresh iv', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const first = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );
      const second = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );
      expect(Buffer.from(first.wrapped)).not.toEqual(
        Buffer.from(second.wrapped)
      );
    });

    it('never returns an all-zero iv', async () => {
      // Guards against the in-place `getRandomValues(arr)` form, which yields
      // an all-zero nonce under this package's setupTests.tsx shim.
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );
      expect(Buffer.from(iv)).not.toEqual(
        Buffer.from(new Uint8Array(KEY_WRAP_IV_BYTES))
      );
    });

    it('throws when prfOut is not 32 bytes', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      await expect(
        wrapRecipientPrivateKey(
          privateKeyRaw,
          new Uint8Array(16).fill(0xa1),
          MOCK_AAD
        )
      ).rejects.toThrow('prfOut must be 32 bytes, got 16');
    });
  });

  describe('unwrapRecipientPrivateKey', () => {
    it('returns the original raw scalar bytes', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      const unwrapped = await unwrapRecipientPrivateKey(
        wrapped,
        iv,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      expect(Buffer.from(unwrapped)).toEqual(Buffer.from(privateKeyRaw));
    });

    it('throws when the AAD differs from the one used to wrap', async () => {
      // Proves the ciphertext is bound to its credential context.
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      await expect(
        unwrapRecipientPrivateKey(wrapped, iv, MOCK_PRF_OUT, MOCK_OTHER_AAD)
      ).rejects.toThrow();
    });

    it('throws when the prfOut is wrong', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      await expect(
        unwrapRecipientPrivateKey(wrapped, iv, MOCK_OTHER_PRF_OUT, MOCK_AAD)
      ).rejects.toThrow();
    });

    it('throws when the iv is wrong', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      await expect(
        unwrapRecipientPrivateKey(
          wrapped,
          new Uint8Array(KEY_WRAP_IV_BYTES).fill(0x00),
          MOCK_PRF_OUT,
          MOCK_AAD
        )
      ).rejects.toThrow();
    });

    it('throws when the ciphertext is corrupted', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      const corrupted = new Uint8Array(wrapped);
      corrupted[0] ^= 0xff;

      await expect(
        unwrapRecipientPrivateKey(corrupted, iv, MOCK_PRF_OUT, MOCK_AAD)
      ).rejects.toThrow();
    });

    it('throws when the authentication tag is corrupted', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      const corrupted = new Uint8Array(wrapped);
      corrupted[corrupted.length - 1] ^= 0xff;

      await expect(
        unwrapRecipientPrivateKey(corrupted, iv, MOCK_PRF_OUT, MOCK_AAD)
      ).rejects.toThrow();
    });

    it('throws when the iv is not 12 bytes', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      await expect(
        unwrapRecipientPrivateKey(
          wrapped,
          new Uint8Array(16),
          MOCK_PRF_OUT,
          MOCK_AAD
        )
      ).rejects.toThrow('keyWrapIv must be 12 bytes, got 16');
    });

    it('throws when prfOut is not 32 bytes', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      await expect(
        unwrapRecipientPrivateKey(
          wrapped,
          iv,
          new Uint8Array(64).fill(0xa1),
          MOCK_AAD
        )
      ).rejects.toThrow('prfOut must be 32 bytes, got 64');
    });
  });
});
