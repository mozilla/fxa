/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type AuthClient from 'fxa-auth-client/browser';
import { SensitiveDataClient } from '../../sensitive-data-client';
import { bytesToBase64url } from '../../base64url';
import { unwrapPasskeyKb } from './consumption';
import { recoverPasswordlessKb } from './recover';

jest.mock('./consumption', () => ({
  __esModule: true,
  unwrapPasskeyKb: jest.fn(),
}));

const unwrapMock = jest.mocked(unwrapPasskeyKb);

const UID = 'a'.repeat(32);
const KB = new Uint8Array(32).fill(0x0b);
const KB_HEX = '0b'.repeat(32);
const PRF_FILL = 9;
const ZEROED = new Uint8Array(32);
const tokenFor = (sub: string) =>
  [
    'header',
    bytesToBase64url(new TextEncoder().encode(JSON.stringify({ sub }))),
    'signature',
  ].join('.');
const MFA_TOKEN = tokenFor(UID);

const authClient = {
  getPasskeyWrap: jest.fn(),
} satisfies Pick<AuthClient, 'getPasskeyWrap'>;

const args = (
  overrides: {
    offerOptIn?: boolean;
    mounted?: boolean;
    mfaToken?: string;
    prfOut?: Uint8Array;
  } = {}
) => ({
  authClient,
  uid: UID,
  mfaToken: overrides.mfaToken ?? MFA_TOKEN,
  credentialId: 'cred',
  prfOut:
    'prfOut' in overrides
      ? overrides.prfOut
      : new Uint8Array(32).fill(PRF_FILL),
  mounted: { current: overrides.mounted ?? true },
  offerOptIn: overrides.offerOptIn ?? true,
  sensitiveDataClient: new SensitiveDataClient(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('recoverPasswordlessKb', () => {
  it('returns the recovered kB as hex and zeroes the bytes behind it', async () => {
    const recovered = new Uint8Array(KB);
    unwrapMock.mockResolvedValue({ ok: true, kB: recovered });
    const a = args();

    await expect(recoverPasswordlessKb(a)).resolves.toEqual({
      outcome: 'recovered',
      kB: KB_HEX,
    });
    expect(recovered).toEqual(ZEROED);
    expect(a.sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it.each([
    ['names no account', 'not-a-jwt'],
    ['names another account', tokenFor('b'.repeat(32))],
  ])('refuses a proof that %s, without fetching', async (_, mfaToken) => {
    const a = args({ mfaToken });

    await expect(recoverPasswordlessKb(a)).resolves.toEqual({
      outcome: 'needs_password',
    });
    expect(unwrapMock).not.toHaveBeenCalled();
  });

  it.each(['no_wrap', 'stale'] as const)(
    'stashes the opt-in material when the wrap is %s',
    async (reason) => {
      unwrapMock.mockResolvedValue({ ok: false, reason });
      const a = args();

      await expect(recoverPasswordlessKb(a)).resolves.toEqual({
        outcome: 'needs_password',
      });

      expect(a.sensitiveDataClient.PasskeyWrapData).toEqual({
        uid: UID,
        credentialId: 'cred',
        mfaToken: MFA_TOKEN,
        prfOut: new Uint8Array(32).fill(PRF_FILL),
      });
    }
  );

  it('makes no offer without PRF output to stash', async () => {
    unwrapMock.mockResolvedValue({ ok: false, reason: 'no_wrap' });
    const a = args({ prfOut: undefined });

    await expect(recoverPasswordlessKb(a)).resolves.toEqual({
      outcome: 'needs_password',
    });
    expect(a.sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('withholds the offer on a client that cannot show it', async () => {
    unwrapMock.mockResolvedValue({ ok: false, reason: 'no_wrap' });
    const a = args({ offerOptIn: false });

    await expect(recoverPasswordlessKb(a)).resolves.toEqual({
      outcome: 'needs_password',
    });
    expect(a.sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('makes no offer when the wrap is unusable for a reason a store cannot fix', async () => {
    unwrapMock.mockResolvedValue({ ok: false, reason: 'failed' });
    const a = args();

    await expect(recoverPasswordlessKb(a)).resolves.toEqual({
      outcome: 'needs_password',
    });
    expect(a.sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('zeroes and withholds the recovered kB when the user leaves mid-fetch', async () => {
    const recovered = new Uint8Array(KB);
    unwrapMock.mockResolvedValue({ ok: true, kB: recovered });
    const a = args({ mounted: false });

    await expect(recoverPasswordlessKb(a)).resolves.toEqual({
      outcome: 'left',
    });
    expect(recovered).toEqual(ZEROED);
  });

  it.each(['no_wrap', 'stale'] as const)(
    'stashes nothing when the user leaves mid-fetch and the wrap is %s',
    async (reason) => {
      unwrapMock.mockResolvedValue({ ok: false, reason });
      const a = args({ mounted: false });

      await expect(recoverPasswordlessKb(a)).resolves.toEqual({
        outcome: 'left',
      });
      expect(a.sensitiveDataClient.PasskeyWrapData).toBeUndefined();
    }
  );

  // `unwrapPasskeyKb` never throws, so a rejection here stands in for the
  // dynamic import failing, e.g. a chunk that will not load offline.
  it('falls back to the password step when the wrap module fails to load', async () => {
    unwrapMock.mockRejectedValue(new Error('ChunkLoadError'));
    const a = args();

    await expect(recoverPasswordlessKb(a)).resolves.toEqual({
      outcome: 'needs_password',
    });
    // A failure says nothing about whether a wrap exists, so offering the
    // opt-in here could overwrite one that does.
    expect(a.sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });
});
