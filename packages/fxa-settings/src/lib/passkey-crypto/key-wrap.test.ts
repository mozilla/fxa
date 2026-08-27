/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Real `crypto.subtle`, but Node's rather than a browser's: `setupTests.tsx`
 * wires it into the global and shims `getRandomValues` to return bytes without
 * filling the array passed in — which the all-zero-iv test below guards.
 *
 * Platform behaviour is not under test. Where it matters, `skR scalar padding`
 * stubs `exportKey` to stand in for an implementation that strips leading zeros.
 */

import { KEY_WRAP_IV_BYTES, PRF_OUT_BYTES, V1_SIZES } from './constants';
import { bindingBytes } from './encoding';
import {
  generateRecipientKeyPair,
  unwrapRecipientPrivateKey,
  wrapRecipientPrivateKey,
} from './key-wrap';
import { suite } from './suite';

const MOCK_PRF_OUT = new Uint8Array(PRF_OUT_BYTES).fill(0xa1);
const MOCK_OTHER_PRF_OUT = new Uint8Array(PRF_OUT_BYTES).fill(0xb2);

const MOCK_CONTEXT = {
  uid: '0011223344556677889900aabbccddee',
  credentialId: 'cGFzc2tleS1jcmVkZW50aWFsLWlk',
};
const MOCK_OTHER_CREDENTIAL = {
  ...MOCK_CONTEXT,
  credentialId: 'b3RoZXItY3JlZGVudGlhbA',
};

describe('passkey-crypto key-wrap', () => {
  describe('generateRecipientKeyPair', () => {
    it('returns a public key of the v1 pkR size', async () => {
      const { publicKey } = await generateRecipientKeyPair();
      expect(publicKey.length).toBe(V1_SIZES.pkR);
    });

    it('returns a raw private-key scalar of the v1 size', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      expect(privateKeyRaw.length).toBe(V1_SIZES.skRRaw);
    });

    it('returns both halves as Uint8Array, not Buffer or ArrayBuffer', async () => {
      const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();
      expect(publicKey.constructor).toBe(Uint8Array);
      expect(privateKeyRaw.constructor).toBe(Uint8Array);
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
      // A valid key, not merely the right length.
      const reimported = await suite.DeserializePrivateKey(
        privateKeyRaw,
        false
      );
      expect(reimported.type).toBe('private');
      expect(reimported.algorithm).toEqual({
        name: 'ECDH',
        namedCurve: 'P-521',
      });
    });
  });

  /**
   * Roughly 1 P-521 key in 512 has a leading zero byte, and SerializePrivateKey
   * decodes the JWK `d` as-is rather than padding it. A short scalar stored in
   * the fixed-width column gets right-padded and can never be opened, so the
   * padding has to happen here.
   */
  describe('skR scalar padding', () => {
    const realExportKey = crypto.subtle.exportKey.bind(crypto.subtle);

    afterEach(() => {
      crypto.subtle.exportKey = realExportKey;
    });

    /**
     * Mimics a platform whose EC JWK export strips leading zero bytes, and
     * records the shortened scalar so a test can assert it survives padding.
     */
    const stripLeadingZeroBytes = (count: number) => {
      const stripped = { scalar: Buffer.alloc(0) };
      crypto.subtle.exportKey = (async (format: string, key: CryptoKey) => {
        const exported = await realExportKey(format as 'jwk', key);
        const jwk = exported as JsonWebKey;
        if (format === 'jwk' && jwk.d) {
          stripped.scalar = Buffer.from(jwk.d, 'base64url').subarray(count);
          jwk.d = stripped.scalar.toString('base64url');
        }
        return exported;
      }) as typeof crypto.subtle.exportKey;
      return stripped;
    };

    // The zero case is the unmodified Node export, so it also covers a
    // full-length scalar being left alone. Padding is asserted against the
    // recorded scalar rather than a length, since left-padding — not
    // right-padding, and not truncation — is what keeps the value unchanged.
    it.each([0, 1, 3])(
      'pads a scalar stripped of %i leading bytes back to the v1 size',
      async (count) => {
        const stripped = stripLeadingZeroBytes(count);

        const { privateKeyRaw } = await generateRecipientKeyPair();

        expect(privateKeyRaw.length).toBe(V1_SIZES.skRRaw);
        expect(Buffer.from(privateKeyRaw)).toEqual(
          Buffer.concat([
            Buffer.alloc(V1_SIZES.skRRaw - stripped.scalar.length),
            stripped.scalar,
          ])
        );
      }
    );
  });

  describe('wrapRecipientPrivateKey', () => {
    it('produces a wrapped key of the v1 prfWrappedSkR size', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );
      expect(wrapped.length).toBe(V1_SIZES.prfWrappedSkR);
    });

    it('produces an iv of the v1 keyWrapIv size', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );
      expect(iv.length).toBe(KEY_WRAP_IV_BYTES);
    });

    // Guards the nonce-reuse hazard documented on wrapRecipientPrivateKey.
    it('uses a fresh iv when wrapping the same skR under the same prfOut twice', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const first = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );
      const second = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );
      expect(Buffer.from(first.iv)).not.toEqual(Buffer.from(second.iv));
    });

    it('produces different ciphertext for identical inputs, via the fresh iv', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const first = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );
      const second = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );
      expect(Buffer.from(first.wrapped)).not.toEqual(
        Buffer.from(second.wrapped)
      );
    });

    it('never returns an all-zero iv', async () => {
      // The in-place getRandomValues form yields all zeros under setupTests.tsx.
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );
      expect(Buffer.from(iv)).not.toEqual(
        Buffer.from(new Uint8Array(KEY_WRAP_IV_BYTES))
      );
    });

    // The only write path into the fixed-width prfWrappedSkR column.
    it.each([65, 67])('throws when skR is %i bytes', async (length) => {
      await expect(
        wrapRecipientPrivateKey(
          new Uint8Array(length),
          MOCK_PRF_OUT,
          MOCK_CONTEXT
        )
      ).rejects.toThrow(
        `skRRaw must be ${V1_SIZES.skRRaw} bytes, got ${length}`
      );
    });

    it('throws when prfOut is not 32 bytes', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      await expect(
        wrapRecipientPrivateKey(
          privateKeyRaw,
          new Uint8Array(16).fill(0xa1),
          MOCK_CONTEXT
        )
      ).rejects.toThrow('prfOut must be 32 bytes, got 16');
    });
  });

  describe('domain separation', () => {
    // Same shape as the HPKE label: decrypting with the bare aad must fail, or
    // the label is not reaching the AES-GCM call.
    it('binds a label into the aad that the caller does not supply', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      const key = await crypto.subtle.importKey(
        'raw',
        MOCK_PRF_OUT,
        'AES-GCM',
        false,
        ['decrypt']
      );

      await expect(
        crypto.subtle.decrypt(
          { name: 'AES-GCM', iv, additionalData: bindingBytes(MOCK_CONTEXT) },
          key,
          wrapped
        )
      ).rejects.toThrow();
    });
  });

  describe('unwrapRecipientPrivateKey', () => {
    it('returns the original raw scalar bytes', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      const unwrapped = await unwrapRecipientPrivateKey(
        wrapped,
        iv,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      expect(Buffer.from(unwrapped)).toEqual(Buffer.from(privateKeyRaw));
    });

    it('throws when the credential context differs from the wrap', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      await expect(
        unwrapRecipientPrivateKey(
          wrapped,
          iv,
          MOCK_PRF_OUT,
          MOCK_OTHER_CREDENTIAL
        )
      ).rejects.toThrow();
    });

    it('throws when the prfOut is wrong', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      await expect(
        unwrapRecipientPrivateKey(wrapped, iv, MOCK_OTHER_PRF_OUT, MOCK_CONTEXT)
      ).rejects.toThrow();
    });

    it('throws when the iv is wrong', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      await expect(
        unwrapRecipientPrivateKey(
          wrapped,
          new Uint8Array(KEY_WRAP_IV_BYTES).fill(0x00),
          MOCK_PRF_OUT,
          MOCK_CONTEXT
        )
      ).rejects.toThrow();
    });

    it('throws when the ciphertext is corrupted', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      const corrupted = new Uint8Array(wrapped);
      corrupted[0] ^= 0xff;

      await expect(
        unwrapRecipientPrivateKey(corrupted, iv, MOCK_PRF_OUT, MOCK_CONTEXT)
      ).rejects.toThrow();
    });

    it('throws when the authentication tag is corrupted', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      const corrupted = new Uint8Array(wrapped);
      corrupted[corrupted.length - 1] ^= 0xff;

      await expect(
        unwrapRecipientPrivateKey(corrupted, iv, MOCK_PRF_OUT, MOCK_CONTEXT)
      ).rejects.toThrow();
    });

    it.each([81, 83])(
      'throws when the wrapped value is %i bytes',
      async (length) => {
        await expect(
          unwrapRecipientPrivateKey(
            new Uint8Array(length),
            new Uint8Array(KEY_WRAP_IV_BYTES),
            MOCK_PRF_OUT,
            MOCK_CONTEXT
          )
        ).rejects.toThrow(
          `prfWrappedSkR must be ${V1_SIZES.prfWrappedSkR} bytes, got ${length}`
        );
      }
    );

    it('throws when the iv is not 12 bytes', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      await expect(
        unwrapRecipientPrivateKey(
          wrapped,
          new Uint8Array(16),
          MOCK_PRF_OUT,
          MOCK_CONTEXT
        )
      ).rejects.toThrow('keyWrapIv must be 12 bytes, got 16');
    });

    it('throws when prfOut is not 32 bytes', async () => {
      const { privateKeyRaw } = await generateRecipientKeyPair();
      const { wrapped, iv } = await wrapRecipientPrivateKey(
        privateKeyRaw,
        MOCK_PRF_OUT,
        MOCK_CONTEXT
      );

      await expect(
        unwrapRecipientPrivateKey(
          wrapped,
          iv,
          new Uint8Array(64).fill(0xa1),
          MOCK_CONTEXT
        )
      ).rejects.toThrow('prfOut must be 32 bytes, got 64');
    });
  });
});
