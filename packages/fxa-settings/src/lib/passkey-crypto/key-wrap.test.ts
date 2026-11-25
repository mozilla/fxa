/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Real `crypto.subtle`, but Node's rather than a browser's: `setupTests.tsx`
 * wires it into the global and shims `getRandomValues` to return bytes without
 * filling the array passed in — which the all-zero tests below guard.
 */

import {
  KB_BYTES,
  KDF_SALT_BYTES,
  KEY_WRAP_IV_BYTES,
  PRF_OUT_BYTES,
  V1_SIZES,
} from './constants';
import { unwrapKb, wrapKb } from './key-wrap';

const MOCK_KB = new Uint8Array(KB_BYTES).fill(0x4b);
const MOCK_PRF_OUT = new Uint8Array(PRF_OUT_BYTES).fill(0xa1);
const MOCK_OTHER_PRF_OUT = new Uint8Array(PRF_OUT_BYTES).fill(0xb2);

const MOCK_AAD = new TextEncoder().encode('uid:credentialId:v1');
const MOCK_OTHER_AAD = new TextEncoder().encode('uid:otherCredentialId:v1');

const hex = (value: Uint8Array) => Buffer.from(value).toString('hex');

describe('passkey-crypto key-wrap', () => {
  describe('wrapKb', () => {
    it('returns every field at its v1 width', async () => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      expect({
        kdfSalt: wrapped.kdfSalt.length,
        keyWrapIv: wrapped.keyWrapIv.length,
        wrappedKb: wrapped.wrappedKb.length,
      }).toEqual(V1_SIZES);
    });

    it('returns every field as a Uint8Array, not an ArrayBuffer', async () => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      expect(
        Object.values(wrapped).map((v) => Object.prototype.toString.call(v))
      ).toEqual([
        '[object Uint8Array]',
        '[object Uint8Array]',
        '[object Uint8Array]',
      ]);
    });

    it('uses a fresh kdfSalt per wrap', async () => {
      const first = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);
      const second = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      expect(hex(first.kdfSalt)).not.toBe(hex(second.kdfSalt));
    });

    it('uses a fresh iv per wrap', async () => {
      const first = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);
      const second = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      expect(hex(first.keyWrapIv)).not.toBe(hex(second.keyWrapIv));
    });

    it('produces different ciphertext for identical inputs', async () => {
      const first = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);
      const second = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      expect(hex(first.wrappedKb)).not.toBe(hex(second.wrappedKb));
    });

    // The in-place getRandomValues form yields all zeros under setupTests.tsx.
    it.each(['kdfSalt', 'keyWrapIv'] as const)(
      'never returns an all-zero %s',
      async (field) => {
        const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

        expect(hex(wrapped[field])).not.toBe(
          hex(new Uint8Array(wrapped[field].length))
        );
      }
    );

    it('leaves the caller kB and prfOut untouched', async () => {
      const kB = Uint8Array.from(MOCK_KB);
      const prfOut = Uint8Array.from(MOCK_PRF_OUT);

      await wrapKb(kB, prfOut, MOCK_AAD);

      expect({ kB: hex(kB), prfOut: hex(prfOut) }).toEqual({
        kB: hex(MOCK_KB),
        prfOut: hex(MOCK_PRF_OUT),
      });
    });

    it.each([31, 33])('throws when kB is %i bytes', async (length) => {
      await expect(
        wrapKb(new Uint8Array(length), MOCK_PRF_OUT, MOCK_AAD)
      ).rejects.toThrow(`kB must be ${KB_BYTES} bytes, got ${length}`);
    });

    it('throws when prfOut is not 32 bytes', async () => {
      await expect(
        wrapKb(MOCK_KB, new Uint8Array(16).fill(0xa1), MOCK_AAD)
      ).rejects.toThrow('prfOut must be 32 bytes, got 16');
    });
  });

  describe('domain separation', () => {
    // Decrypting with the bare aad and the raw prfOut as the key must fail, or
    // neither the label nor the HKDF step is reaching the AES-GCM call.
    it('binds a label into the aad and derives the key, rather than using prfOut raw', async () => {
      const { keyWrapIv, wrappedKb } = await wrapKb(
        MOCK_KB,
        MOCK_PRF_OUT,
        MOCK_AAD
      );

      const rawKey = await crypto.subtle.importKey(
        'raw',
        MOCK_PRF_OUT,
        'AES-GCM',
        false,
        ['decrypt']
      );

      await expect(
        crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: keyWrapIv, additionalData: MOCK_AAD },
          rawKey,
          wrappedKb
        )
      ).rejects.toThrow();
    });
  });

  describe('unwrapKb', () => {
    it('returns the original kB', async () => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      const kB = await unwrapKb(wrapped, MOCK_PRF_OUT, MOCK_AAD);

      expect(hex(kB)).toBe(hex(MOCK_KB));
    });

    it('returns a Uint8Array', async () => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      const kB = await unwrapKb(wrapped, MOCK_PRF_OUT, MOCK_AAD);

      expect(Object.getPrototypeOf(kB)).toBe(Uint8Array.prototype);
    });

    it('throws when the AAD differs from the one used to wrap', async () => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      await expect(
        unwrapKb(wrapped, MOCK_PRF_OUT, MOCK_OTHER_AAD)
      ).rejects.toThrow();
    });

    it('throws when the prfOut is wrong', async () => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      await expect(
        unwrapKb(wrapped, MOCK_OTHER_PRF_OUT, MOCK_AAD)
      ).rejects.toThrow();
    });

    // Corrupted in place at the correct width, so the width guards pass and
    // only the tag check can refuse it.
    it.each(['kdfSalt', 'keyWrapIv', 'wrappedKb'] as const)(
      'throws when %s is corrupted',
      async (field) => {
        const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);
        const corrupted = Uint8Array.from(wrapped[field]);
        corrupted[0] ^= 0xff;

        await expect(
          unwrapKb({ ...wrapped, [field]: corrupted }, MOCK_PRF_OUT, MOCK_AAD)
        ).rejects.toThrow();
      }
    );

    it('throws when the authentication tag is corrupted', async () => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);
      const wrappedKb = Uint8Array.from(wrapped.wrappedKb);
      wrappedKb[wrappedKb.length - 1] ^= 0xff;

      await expect(
        unwrapKb({ ...wrapped, wrappedKb }, MOCK_PRF_OUT, MOCK_AAD)
      ).rejects.toThrow();
    });

    it.each([
      ['kdfSalt', KDF_SALT_BYTES],
      ['keyWrapIv', KEY_WRAP_IV_BYTES],
      ['wrappedKb', V1_SIZES.wrappedKb],
    ] as const)('throws when %s is not %i bytes', async (field, width) => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      await expect(
        unwrapKb(
          { ...wrapped, [field]: new Uint8Array(width - 1) },
          MOCK_PRF_OUT,
          MOCK_AAD
        )
      ).rejects.toThrow(`${field} must be ${width} bytes, got ${width - 1}`);
    });

    it('throws when prfOut is not 32 bytes', async () => {
      const wrapped = await wrapKb(MOCK_KB, MOCK_PRF_OUT, MOCK_AAD);

      await expect(
        unwrapKb(wrapped, new Uint8Array(16).fill(0xa1), MOCK_AAD)
      ).rejects.toThrow('prfOut must be 32 bytes, got 16');
    });
  });
});
