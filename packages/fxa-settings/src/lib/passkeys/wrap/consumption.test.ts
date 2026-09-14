/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import type AuthClient from 'fxa-auth-client/browser';
import { ERRNO } from '@fxa/accounts/errors';
import { unwrapPasskeyKb } from './consumption';
import { openWrapEnvelope } from '../../passkey-crypto';
import { bytesToBase64url } from '../../base64url';

jest.mock('@sentry/browser', () => ({
  __esModule: true,
  captureException: jest.fn(),
}));
jest.mock('../../passkey-crypto', () => ({
  __esModule: true,
  openWrapEnvelope: jest.fn(),
}));

const prf = () => new Uint8Array(32).fill(7);
const UID = 'a'.repeat(32);
const MFA_TOKEN = [
  'header',
  bytesToBase64url(new TextEncoder().encode(JSON.stringify({ sub: UID }))),
  'signature',
].join('.');
const wrap: Awaited<ReturnType<AuthClient['getPasskeyWrap']>> = {
  createdAt: 1,
  pkR: new Uint8Array(1),
  prfWrappedSkR: new Uint8Array(1),
  keyWrapIv: new Uint8Array(1),
  hpkeEncapsulatedSecret: new Uint8Array(1),
  hpkeSealedKb: new Uint8Array(1),
};
const { createdAt: _createdAt, ...envelope } = wrap;
const args = (prfOut?: Uint8Array) => ({
  mfaToken: MFA_TOKEN,
  credentialId: 'cred',
  prfOut,
});
const client = (impl: () => Promise<unknown>) => ({
  getPasskeyWrap: jest.fn(impl) as unknown as jest.MockedFunction<
    AuthClient['getPasskeyWrap']
  >,
});

describe('unwrapPasskeyKb', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns kB when the envelope opens, and zeroes prfOut', async () => {
    const kB = new Uint8Array(32).fill(1);
    (openWrapEnvelope as jest.Mock).mockResolvedValue(kB);
    const prfOut = prf();
    const res = await unwrapPasskeyKb(
      client(async () => wrap),
      args(prfOut)
    );
    expect(res).toEqual({ ok: true, kB });
    expect(prfOut.every((b) => b === 0)).toBe(true);
    expect(openWrapEnvelope).toHaveBeenCalledWith({
      envelope,
      prfOut: expect.any(Uint8Array),
      uid: UID,
      credentialId: 'cred',
    });
  });

  it('is proof_invalid without a fetch when the token names no uid', async () => {
    const c = client(async () => wrap);
    const prfOut = prf();
    expect(
      await unwrapPasskeyKb(c, { ...args(prfOut), mfaToken: 'not-a-jwt' })
    ).toEqual({ ok: false, reason: 'proof_invalid' });
    expect(c.getPasskeyWrap).not.toHaveBeenCalled();
    expect(prfOut.every((b) => b === 0)).toBe(true);
  });

  it('is no_prf without a fetch when prfOut is missing or the wrong width', async () => {
    const c = client(async () => wrap);
    expect(await unwrapPasskeyKb(c, args(undefined))).toEqual({
      ok: false,
      reason: 'no_prf',
    });
    expect(await unwrapPasskeyKb(c, args(new Uint8Array(4)))).toEqual({
      ok: false,
      reason: 'no_prf',
    });
    expect(c.getPasskeyWrap).not.toHaveBeenCalled();
  });

  it.each([
    [ERRNO.PASSKEY_WRAP_NOT_FOUND, 'no_wrap'],
    [ERRNO.PASSKEY_NOT_FOUND, 'passkey_not_found'],
    [ERRNO.INVALID_MFA_TOKEN, 'proof_invalid'],
    [ERRNO.PASSKEY_WRAP_STALE, 'stale'],
    [ERRNO.FEATURE_NOT_ENABLED, 'fetch_failed'],
    [ERRNO.THROTTLED, 'fetch_failed'],
  ])('maps errno %i to %s without Sentry', async (errno, reason) => {
    const res = await unwrapPasskeyKb(
      client(async () => {
        throw { errno };
      }),
      args(prf())
    );
    expect(res).toEqual({ ok: false, reason });
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('is fetch_failed with a Sentry tag for any other errno', async () => {
    const res = await unwrapPasskeyKb(
      client(async () => {
        throw { errno: 999 };
      }),
      args(prf())
    );
    expect(res).toEqual({ ok: false, reason: 'fetch_failed' });
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { errno: '999' },
    });
  });

  it('is decrypt_failed when the envelope does not open, and still zeroes prfOut', async () => {
    (openWrapEnvelope as jest.Mock).mockRejectedValue(new Error('tag'));
    const prfOut = prf();
    const res = await unwrapPasskeyKb(
      client(async () => wrap),
      args(prfOut)
    );
    expect(res).toEqual({ ok: false, reason: 'decrypt_failed' });
    expect(prfOut.every((b) => b === 0)).toBe(true);
  });
});
