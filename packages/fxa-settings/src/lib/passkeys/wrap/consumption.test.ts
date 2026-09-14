/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import { unwrapPasskeyKb } from './consumption';
import {
  createWrapEnvelope,
  type openWrapEnvelope as OpenWrapEnvelope,
} from '../../passkey-crypto';

// Real crypto by default; mocked only to force the branches a genuine
// envelope cannot reach.
const mockOpenWrapEnvelope: jest.MockedFunction<typeof OpenWrapEnvelope> =
  jest.fn();
jest.mock('../../passkey-crypto', () => ({
  ...jest.requireActual('../../passkey-crypto'),
  openWrapEnvelope: (...args: Parameters<typeof OpenWrapEnvelope>) =>
    mockOpenWrapEnvelope(...args),
}));

const mockCaptureException = jest.fn();
jest.mock('@sentry/browser', () => ({
  ...jest.requireActual('@sentry/browser'),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

const UID = 'a'.repeat(32);
const CREDENTIAL_ID = 'cred';
const KB = new Uint8Array(32).fill(0x0b);
const prf = () => new Uint8Array(32).fill(7);

const args = (prfOut?: Uint8Array) => ({
  mfaToken: 'mfa-token',
  uid: UID,
  credentialId: CREDENTIAL_ID,
  prfOut,
});

const client = (impl: () => Promise<unknown>) =>
  ({
    getPasskeyWrap: jest.fn(impl),
  }) as unknown as {
    getPasskeyWrap: jest.MockedFunction<AuthClient['getPasskeyWrap']>;
  };

/** A wrap as the server would return it, sealed by the real crypto. */
const storedWrap = async (over: { uid?: string; credentialId?: string } = {}) =>
  ({
    createdAt: 1,
    ...(await createWrapEnvelope({
      kB: new Uint8Array(KB),
      prfOut: prf(),
      uid: over.uid ?? UID,
      credentialId: over.credentialId ?? CREDENTIAL_ID,
    })),
  }) as Awaited<ReturnType<AuthClient['getPasskeyWrap']>>;

beforeEach(() => {
  jest.clearAllMocks();
  mockOpenWrapEnvelope.mockImplementation(
    jest.requireActual('../../passkey-crypto').openWrapEnvelope
  );
});

describe('unwrapPasskeyKb', () => {
  it('recovers the exact kB the envelope was sealed over', async () => {
    const c = client(async () => storedWrap());

    const res = await unwrapPasskeyKb(c, args(prf()));

    expect(res).toEqual({ ok: true, kB: KB });
    expect(c.getPasskeyWrap).toHaveBeenCalledWith('mfa-token', CREDENTIAL_ID);
  });

  it('will not open a wrap bound to a different account', async () => {
    const res = await unwrapPasskeyKb(
      client(async () => storedWrap({ uid: 'b'.repeat(32) })),
      args(prf())
    );

    expect(res).toEqual({ ok: false, reason: 'failed' });
  });

  it.each([
    ['missing', undefined],
    ['short', new Uint8Array(4)],
    ['spent', new Uint8Array(32)],
  ])('fails without a fetch when prfOut is %s', async (_, prfOut) => {
    const c = client(async () => storedWrap());

    expect(await unwrapPasskeyKb(c, args(prfOut))).toEqual({
      ok: false,
      reason: 'failed',
    });
    expect(c.getPasskeyWrap).not.toHaveBeenCalled();
  });

  it.each([
    [ERRNO.PASSKEY_WRAP_NOT_FOUND, 'no_wrap'],
    [ERRNO.PASSKEY_WRAP_STALE, 'stale'],
    [ERRNO.PASSKEY_NOT_FOUND, 'failed'],
    [ERRNO.INVALID_MFA_TOKEN, 'failed'],
    [ERRNO.FEATURE_NOT_ENABLED, 'failed'],
    [ERRNO.THROTTLED, 'failed'],
    [ERRNO.REQUEST_BLOCKED, 'failed'],
  ])('maps errno %i to %s without Sentry', async (errno, reason) => {
    const res = await unwrapPasskeyKb(
      client(async () => {
        throw Object.assign(new Error('refused'), { errno });
      }),
      args(prf())
    );

    expect(res).toEqual({ ok: false, reason });
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it.each([
    ['offline', new TypeError('Failed to fetch')],
    ['timed out', new DOMException('aborted', 'AbortError')],
  ])('fails without Sentry when the client is %s', async (_, err) => {
    const res = await unwrapPasskeyKb(
      client(async () => {
        throw err;
      }),
      args(prf())
    );

    expect(res).toEqual({ ok: false, reason: 'failed' });
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('fails and reports an errno it does not expect', async () => {
    const res = await unwrapPasskeyKb(
      client(async () => {
        throw Object.assign(new Error('refused'), { errno: 999 });
      }),
      args(prf())
    );

    expect(res).toEqual({ ok: false, reason: 'failed' });
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('passkey-wrap-fetch error'),
      { tags: { errno: '999' } }
    );
  });

  it('reports a wrap that will not open, which no retry can clear', async () => {
    mockOpenWrapEnvelope.mockRejectedValue(new Error('tag'));

    const res = await unwrapPasskeyKb(
      client(async () => storedWrap()),
      args(prf())
    );

    expect(res).toEqual({ ok: false, reason: 'failed' });
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('passkey-wrap-decrypt error')
    );
  });

  it.each([
    ['an all-zero kB the AEAD tag still accepts', new Uint8Array(32)],
    ['a kB of the wrong length', new Uint8Array(16).fill(0x0b)],
  ])('rejects, zeroes and reports %s', async (_, opened) => {
    mockOpenWrapEnvelope.mockResolvedValue(opened);

    const res = await unwrapPasskeyKb(
      client(async () => storedWrap()),
      args(prf())
    );

    expect(res).toEqual({ ok: false, reason: 'failed' });
    expect(opened).toEqual(new Uint8Array(opened.length));
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('passkey-wrap-decrypt error')
    );
  });
});
