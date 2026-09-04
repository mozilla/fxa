/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { V1_SIZES } from './constants';
import {
  buildEnvelopeContext,
  createWrapEnvelope,
  openWrapEnvelope,
} from './envelope';

const UID = '0011223344556677889900aabbccddee';
const CREDENTIAL_ID = 'cGFzc2tleS1jcmVkZW50aWFsLWlk';
const OTHER_CREDENTIAL_ID = 'b3RoZXItY3JlZGVudGlhbA';
const KB = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
const PRF_OUT = Uint8Array.from({ length: 32 }, (_, index) => 0xff - index);

const hex = (value: Uint8Array) => Buffer.from(value).toString('hex');

const context = (
  overrides: Partial<Parameters<typeof buildEnvelopeContext>[0]> = {}
) =>
  buildEnvelopeContext({ uid: UID, credentialId: CREDENTIAL_ID, ...overrides });

const create = () =>
  createWrapEnvelope({
    kB: KB,
    prfOut: PRF_OUT,
    uid: UID,
    credentialId: CREDENTIAL_ID,
  });

describe('buildEnvelopeContext', () => {
  describe('frozen representation', () => {
    // Golden vectors are the only thing that catches this changing: every
    // other test here builds and consumes the context with the same code, so
    // it passes whatever the representation is.
    it('decodes uid as hex', () => {
      expect(hex(context()).slice(4, 4 + UID.length)).toBe(UID);
    });

    it('decodes credentialId as base64url', () => {
      expect(hex(context()).slice(4 + UID.length + 4)).toBe(
        Buffer.from('passkey-credential-id').toString('hex')
      );
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
    it.each([
      ['not hex', 'zzeeddccbbaa00998877665544332211'],
      ['uppercase hex', 'FFEEDDCCBBAA00998877665544332211'],
      ['odd length', '0011223344556677889900aabbccdde'],
      ['too short', '00112233445566778899'],
      ['too long', '0011223344556677889900aabbccddeeff'],
    ])('rejects a uid that is %s', (_label, uid) => {
      expect(() => context({ uid })).toThrow();
    });

    it.each([
      ['standard base64 padding', 'cGFzc2tleS1jcmVkZW50aWFs=='],
      ['standard base64 alphabet', 'cGFzc2tleS9jcmVk+250aWFs'],
      ['empty', ''],
    ])('rejects a credentialId with %s', (_label, credentialId) => {
      expect(() => context({ credentialId })).toThrow();
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
    await create();

    expect({ kB: hex(KB), prfOut: hex(PRF_OUT) }).toEqual({
      kB: hex(Uint8Array.from({ length: 32 }, (_, index) => index + 1)),
      prfOut: hex(Uint8Array.from({ length: 32 }, (_, index) => 0xff - index)),
    });
  });

  it('rejects a kB that is not 32 bytes', async () => {
    await expect(
      createWrapEnvelope({
        kB: new Uint8Array(31),
        prfOut: PRF_OUT,
        uid: UID,
        credentialId: CREDENTIAL_ID,
      })
    ).rejects.toThrow('kB must be 32 bytes, got 31');
  });

  it('rejects a prfOut that is not 32 bytes', async () => {
    await expect(
      createWrapEnvelope({
        kB: KB,
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
      prfOut: PRF_OUT,
      uid: UID,
      credentialId: CREDENTIAL_ID,
    });

    expect(hex(kB)).toBe(hex(KB));
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
          prfOut: PRF_OUT,
          uid: UID,
          credentialId: CREDENTIAL_ID,
        })
      ).rejects.toThrow(`${field} must be a Uint8Array`);
    }
  );

  it('names the field when one is stored at the wrong width', async () => {
    const envelope = { ...(await create()) };
    envelope.hpkeSealedKb = envelope.hpkeSealedKb.subarray(0, 47);

    await expect(
      openWrapEnvelope({
        envelope,
        prfOut: PRF_OUT,
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
    ).rejects.toThrow(
      expect.objectContaining({ name: 'OperationError' }) as Error
    );
  });

  it('fails under a different credential', async () => {
    const envelope = await create();

    await expect(
      openWrapEnvelope({
        envelope,
        prfOut: PRF_OUT,
        uid: UID,
        credentialId: OTHER_CREDENTIAL_ID,
      })
    ).rejects.toThrow(
      expect.objectContaining({ name: 'OperationError' }) as Error
    );
  });
});
