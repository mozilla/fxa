/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { CREDENTIAL_ID_MAX_BYTES, UID_BYTES, V1_SIZES } from './constants';
import {
  buildEnvelopeContext,
  createWrapEnvelope,
  openWrapEnvelope,
} from './envelope';

const UID = '0011223344556677889900aabbccddee';
const CREDENTIAL_ID = 'cGFzc2tleS1jcmVkZW50aWFsLWlk';
const OTHER_CREDENTIAL_ID = 'b3RoZXItY3JlZGVudGlhbA';
// Held as hex, not as arrays: this module zeroes buffers, so an assertion that
// compares a result against a shared input would pass on two zeroed arrays.
const KB_HEX =
  '0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20';
const PRF_OUT_HEX =
  'fffefdfcfbfaf9f8f7f6f5f4f3f2f1f0efeeedecebeae9e8e7e6e5e4e3e2e1e0';

// Base64url carries 6 bits per character, so the byte ceiling fixes the
// character ceiling. 1365 is not a valid length, hence +2 for the case above it.
const CEILING_CHARS = (CREDENTIAL_ID_MAX_BYTES * 8) / 6;

const hex = (value: Uint8Array) => Buffer.from(value).toString('hex');
const bytes = (value: string) => Uint8Array.from(Buffer.from(value, 'hex'));

const context = (
  overrides: Partial<Parameters<typeof buildEnvelopeContext>[0]> = {}
) =>
  buildEnvelopeContext({ uid: UID, credentialId: CREDENTIAL_ID, ...overrides });

const create = () =>
  createWrapEnvelope({
    kB: bytes(KB_HEX),
    prfOut: bytes(PRF_OUT_HEX),
    uid: UID,
    credentialId: CREDENTIAL_ID,
  });

describe('buildEnvelopeContext', () => {
  describe('frozen representation', () => {
    // Pinned as bytes, not round-tripped: every other test here builds and
    // consumes the context with the same code, so it passes whatever the
    // representation is.
    // Offsets derived, not hardcoded: two bytes of length prefix, then the
    // field. These pin the fields individually so a drift names which one.
    const PREFIX_CHARS = 4;
    const UID_CHARS = UID_BYTES * 2;

    it('decodes uid as hex', () => {
      expect(hex(context()).slice(PREFIX_CHARS, PREFIX_CHARS + UID_CHARS)).toBe(
        UID
      );
    });

    it('decodes credentialId as base64url', () => {
      expect(
        hex(context()).slice(PREFIX_CHARS + UID_CHARS + PREFIX_CHARS)
      ).toBe(Buffer.from('passkey-credential-id').toString('hex'));
    });

    it('frames uid first, then credentialId', () => {
      // 0x0010 = 16-byte uid, 0x0015 = 21-byte credentialId.
      expect(hex(context())).toBe(
        `0010${UID}0015${Buffer.from('passkey-credential-id').toString('hex')}`
      );
    });
  });

  describe('framing', () => {
    // Length prefixes are insurance, not a fix for a live bug: uid is validated
    // to a fixed 16 bytes, so `uid || credentialId` is already unambiguous
    // today. The prefixes mean that stays true if a variable-length field is
    // ever added to the context, where plain concatenation would silently start
    // letting two different inputs frame to the same bytes.
    it('gives distinct output for distinct credentials', () => {
      expect(hex(context({ credentialId: OTHER_CREDENTIAL_ID }))).not.toBe(
        hex(context())
      );
    });

    it('gives distinct output for distinct accounts', () => {
      expect(
        hex(context({ uid: 'ffeeddccbbaa00998877665544332211' }))
      ).not.toBe(hex(context()));
    });

    it('is deterministic for the same inputs', () => {
      expect(hex(context())).toBe(hex(context()));
    });
  });

  describe('input validation', () => {
    // Split by guard: an odd-length uid also fails the width check, because
    // `match(/../g)` drops the trailing character, so one shared assertion
    // would pass with the hex guard deleted.
    it.each([
      ['not hex', 'zzeeddccbbaa00998877665544332211'],
      ['uppercase hex', 'FFEEDDCCBBAA00998877665544332211'],
      ['odd length', '0011223344556677889900aabbccdde'],
      ['empty', ''],
    ])('rejects a uid that is %s', (_label, uid) => {
      expect(() => context({ uid })).toThrow(
        'uid must be an even-length lowercase hex string'
      );
    });

    it.each([
      ['too short', '00112233445566778899'],
      ['too long', '0011223344556677889900aabbccddeeff'],
    ])('rejects a uid that is %s', (_label, uid) => {
      expect(() => context({ uid })).toThrow(/^uid must be 16 bytes, got \d+$/);
    });

    it.each([
      ['standard base64 padding', 'cGFzc2tleS1jcmVkZW50aWFs=='],
      ['standard base64 alphabet', 'cGFzc2tleS9jcmVk+250aWFs'],
      // Valid alphabet, 25 characters: only the length half of the guard can
      // reject this, and atob would otherwise throw unnamed.
      ['a length that cannot be base64url', `${'cGFzc2tl'.repeat(3)}A`],
      ['empty', ''],
    ])('rejects a credentialId with %s', (_label, credentialId) => {
      expect(() => context({ credentialId })).toThrow(
        'credentialId must be base64url with no padding'
      );
    });

    // The wrap column is VARBINARY(1023) and the route validator caps the
    // encoded form at 1364 characters, so anything longer seals an envelope the
    // server refuses to store. Fail before doing the crypto.
    it('accepts a credentialId at the 1023-byte ceiling', () => {
      expect(context({ credentialId: 'A'.repeat(CEILING_CHARS) })).toHaveLength(
        2 + UID_BYTES + 2 + CREDENTIAL_ID_MAX_BYTES
      );
    });

    it('rejects a credentialId one byte over the ceiling', () => {
      expect(() =>
        context({ credentialId: 'A'.repeat(CEILING_CHARS + 2) })
      ).toThrow('credentialId must be at most 1023 bytes, got 1024');
    });
  });
});

describe('createWrapEnvelope', () => {
  it('returns every field at its v1 width', async () => {
    const envelope = await create();

    expect({
      pkR: envelope.pkR.length,
      prfWrappedSkR: envelope.prfWrappedSkR.length,
      keyWrapIv: envelope.keyWrapIv.length,
      hpkeEncapsulatedSecret: envelope.hpkeEncapsulatedSecret.length,
      hpkeSealedKb: envelope.hpkeSealedKb.length,
    }).toEqual({
      pkR: V1_SIZES.pkR,
      prfWrappedSkR: V1_SIZES.prfWrappedSkR,
      keyWrapIv: V1_SIZES.keyWrapIv,
      hpkeEncapsulatedSecret: V1_SIZES.hpkeEncapsulatedSecret,
      hpkeSealedKb: V1_SIZES.hpkeSealedKb,
    });
  });

  it('returns the envelope fields and nothing else, so skR cannot escape', async () => {
    expect(Object.keys(await create()).sort()).toEqual([
      'hpkeEncapsulatedSecret',
      'hpkeSealedKb',
      'keyWrapIv',
      'pkR',
      'prfWrappedSkR',
    ]);
  });

  it('generates a fresh recipient keypair per call', async () => {
    const [first, second] = await Promise.all([create(), create()]);

    expect(hex(first.pkR)).not.toBe(hex(second.pkR));
  });

  it('leaves the caller kB and prfOut untouched', async () => {
    const kB = bytes(KB_HEX);
    const prfOut = bytes(PRF_OUT_HEX);

    await createWrapEnvelope({
      kB,
      prfOut,
      uid: UID,
      credentialId: CREDENTIAL_ID,
    });

    expect({ kB: hex(kB), prfOut: hex(prfOut) }).toEqual({
      kB: KB_HEX,
      prfOut: PRF_OUT_HEX,
    });
  });

  it('rejects an oversized credentialId', async () => {
    await expect(
      createWrapEnvelope({
        kB: bytes(KB_HEX),
        prfOut: bytes(PRF_OUT_HEX),
        uid: UID,
        credentialId: 'A'.repeat(CEILING_CHARS + 2),
      })
    ).rejects.toThrow('credentialId must be at most 1023 bytes, got 1024');
  });

  it('rejects a kB that is not 32 bytes', async () => {
    await expect(
      createWrapEnvelope({
        kB: new Uint8Array(31),
        prfOut: bytes(PRF_OUT_HEX),
        uid: UID,
        credentialId: CREDENTIAL_ID,
      })
    ).rejects.toThrow('kB must be 32 bytes, got 31');
  });

  it('rejects a prfOut that is not 32 bytes', async () => {
    await expect(
      createWrapEnvelope({
        kB: bytes(KB_HEX),
        prfOut: new Uint8Array(16),
        uid: UID,
        credentialId: CREDENTIAL_ID,
      })
    ).rejects.toThrow('prfOut must be 32 bytes, got 16');
  });
});

describe('openWrapEnvelope', () => {
  it('recovers the kB that was wrapped', async () => {
    const envelope = await create();

    const kB = await openWrapEnvelope({
      envelope,
      prfOut: bytes(PRF_OUT_HEX),
      uid: UID,
      credentialId: CREDENTIAL_ID,
    });

    expect(hex(kB)).toBe(KB_HEX);
  });

  // normalizeEnvelope copies into the local realm, which is what leaves the
  // caller's envelope reusable — a sign-in retry re-opens the same one.
  it('opens the same envelope twice', async () => {
    const envelope = await create();
    const open = () =>
      openWrapEnvelope({
        envelope,
        prfOut: bytes(PRF_OUT_HEX),
        uid: UID,
        credentialId: CREDENTIAL_ID,
      });

    expect([hex(await open()), hex(await open())]).toEqual([KB_HEX, KB_HEX]);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'not-an-envelope'],
  ])('rejects an envelope that is %s', async (_label, envelope) => {
    await expect(
      openWrapEnvelope({
        envelope: envelope as unknown as PasskeyWrapEnvelope,
        prfOut: bytes(PRF_OUT_HEX),
        uid: UID,
        credentialId: CREDENTIAL_ID,
      })
    ).rejects.toThrow('envelope must be an object');
  });

  it.each([
    'pkR',
    'prfWrappedSkR',
    'keyWrapIv',
    'hpkeEncapsulatedSecret',
    'hpkeSealedKb',
  ] as const)(
    'names %s when it is missing from the envelope',
    async (field) => {
      const envelope = { ...(await create()) } as Partial<PasskeyWrapEnvelope>;
      delete envelope[field];

      await expect(
        openWrapEnvelope({
          envelope: envelope as PasskeyWrapEnvelope,
          prfOut: bytes(PRF_OUT_HEX),
          uid: UID,
          credentialId: CREDENTIAL_ID,
        })
      ).rejects.toThrow(`${field} must be a Uint8Array`);
    }
  );

  // The Uint16Array carries the same element count as the field, so the width
  // guard passes and only the brand check can reject it.
  it.each([
    ['a DataView', (value: Uint8Array) => new DataView(value.buffer)],
    ['a Uint16Array', (value: Uint8Array) => new Uint16Array(value.length)],
    // Reads as [object Uint8Array] and would coerce to real zeroed bytes, so
    // only the isView half of the check rejects it.
    [
      'an object with a spoofed toStringTag',
      (value: Uint8Array) => ({
        length: value.length,
        [Symbol.toStringTag]: 'Uint8Array',
      }),
    ],
  ])('rejects hpkeSealedKb given as %s', async (_label, corrupt) => {
    const envelope = await create();

    await expect(
      openWrapEnvelope({
        envelope: {
          ...envelope,
          hpkeSealedKb: corrupt(envelope.hpkeSealedKb),
        } as unknown as PasskeyWrapEnvelope,
        prfOut: bytes(PRF_OUT_HEX),
        uid: UID,
        credentialId: CREDENTIAL_ID,
      })
    ).rejects.toThrow('hpkeSealedKb must be a Uint8Array');
  });

  it('names hpkeSealedKb when it is stored at the wrong width', async () => {
    const envelope = await create();
    envelope.hpkeSealedKb = envelope.hpkeSealedKb.subarray(0, 47);

    await expect(
      openWrapEnvelope({
        envelope,
        prfOut: bytes(PRF_OUT_HEX),
        uid: UID,
        credentialId: CREDENTIAL_ID,
      })
    ).rejects.toThrow('hpkeSealedKb must be 48 bytes, got 47');
  });

  it('surfaces the decryption failure for a wrong prfOut', async () => {
    const envelope = await create();

    // The native AES-GCM failure reaches the caller unwrapped. Anything this
    // module threw instead would be indistinguishable from its own validation
    // errors, which mean something the caller can act on.
    await expect(
      openWrapEnvelope({
        envelope,
        prfOut: new Uint8Array(32).fill(7),
        uid: UID,
        credentialId: CREDENTIAL_ID,
      })
    ).rejects.toThrow(expect.objectContaining({ name: 'OperationError' }));
  });

  // A Node Buffer is a Uint8Array from another realm under jsdom, the case that
  // clears a brand check and then trips `hpke`'s own `instanceof` guard.
  it('accepts fields from another realm by copying them into this one', async () => {
    const envelope = await create();
    const foreign = Object.fromEntries(
      Object.entries(envelope).map(([field, value]) => [
        field,
        Buffer.from(value as Uint8Array),
      ])
    ) as unknown as typeof envelope;

    const kB = await openWrapEnvelope({
      envelope: foreign,
      prfOut: bytes(PRF_OUT_HEX),
      uid: UID,
      credentialId: CREDENTIAL_ID,
    });

    expect(hex(kB)).toBe(KB_HEX);
  });

  // Corrupted in place at the correct width, so normalizeEnvelope and the AES
  // layer both pass and the failure comes from HPKE. Every other negative case
  // here stops at the first layer. The two fields fail at different stages:
  // the ciphertext at the AEAD open, the ephemeral key at decapsulation.
  it.each([
    ['hpkeSealedKb', 'OpenError'],
    ['hpkeEncapsulatedSecret', 'DecapError'],
  ] as const)(
    'surfaces the HPKE failure for a corrupted %s',
    async (field, name) => {
      const envelope = await create();
      const corrupted = Uint8Array.from(envelope[field]);
      corrupted[0] ^= 0xff;

      await expect(
        openWrapEnvelope({
          envelope: { ...envelope, [field]: corrupted },
          prfOut: bytes(PRF_OUT_HEX),
          uid: UID,
          credentialId: CREDENTIAL_ID,
        })
      ).rejects.toThrow(expect.objectContaining({ name }));
    }
  );

  it('surfaces the decryption failure under a different credential', async () => {
    const envelope = await create();

    await expect(
      openWrapEnvelope({
        envelope,
        prfOut: bytes(PRF_OUT_HEX),
        uid: UID,
        credentialId: OTHER_CREDENTIAL_ID,
      })
    ).rejects.toThrow(expect.objectContaining({ name: 'OperationError' }));
  });
});
