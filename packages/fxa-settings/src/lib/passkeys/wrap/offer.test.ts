/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import { stashPasskeyWrapOffer } from './offer';
import { SensitiveDataClient } from '../../sensitive-data-client';

jest.mock('@sentry/browser', () => ({
  __esModule: true,
  captureException: jest.fn(),
}));

const COMPLETION = {
  uid: 'uid-123',
  sessionToken: 'session-token',
  verified: true,
  hasPassword: true,
  mfaToken: 'mfa-token',
};
const PRF_OUT = new Uint8Array(32).fill(3);

const stash = (
  getPasskeyWrap: jest.Mock,
  overrides: Record<string, unknown> = {}
) => {
  const sensitiveDataClient = new SensitiveDataClient();
  const run = stashPasskeyWrapOffer({
    authClient: { getPasskeyWrap },
    completion: COMPLETION,
    credentialId: 'cred-id',
    prfOut: PRF_OUT,
    mounted: { current: true },
    sensitiveDataClient,
    ...overrides,
  });
  return { run, sensitiveDataClient };
};

const rejectWith = (errno: number) =>
  jest.fn().mockRejectedValue(Object.assign(new Error('nope'), { errno }));

beforeEach(() => jest.clearAllMocks());

describe('stashPasskeyWrapOffer', () => {
  it.each([
    ['no wrap is stored', ERRNO.PASSKEY_WRAP_NOT_FOUND],
    ['the stored wrap predates the key rotation', ERRNO.PASSKEY_WRAP_STALE],
  ])('holds the material with the proof when %s', async (_label, errno) => {
    const getPasskeyWrap = rejectWith(errno);
    const { run, sensitiveDataClient } = stash(getPasskeyWrap);

    await run;

    expect(getPasskeyWrap).toHaveBeenCalledWith('mfa-token', 'cred-id');
    expect(sensitiveDataClient.PasskeyWrapData).toEqual({
      uid: COMPLETION.uid,
      credentialId: 'cred-id',
      mfaToken: 'mfa-token',
      prfOut: PRF_OUT,
    });
  });

  it('holds nothing when a wrap is already stored', async () => {
    const { run, sensitiveDataClient } = stash(
      jest.fn().mockResolvedValue({ createdAt: 1_700_000_000_000 })
    );

    await run;

    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('holds nothing and reports it when the lookup fails for another reason', async () => {
    const { run, sensitiveDataClient } = stash(rejectWith(ERRNO.INVALID_TOKEN));

    await run;

    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'passkey-wrap-probe error' }),
      { tags: { errno: String(ERRNO.INVALID_TOKEN) } }
    );
  });

  it.each([
    ['the server flag is off', ERRNO.FEATURE_NOT_ENABLED],
    ['the probe is throttled', ERRNO.THROTTLED],
  ])('holds nothing without reporting when %s', async (_label, errno) => {
    const { run, sensitiveDataClient } = stash(rejectWith(errno));

    await run;

    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it.each([
    ['the authenticator returned no PRF output', { prfOut: undefined }],
    [
      'the account still has to create a password',
      { completion: { ...COMPLETION, hasPassword: false } },
    ],
    [
      'the server minted no proof',
      { completion: { ...COMPLETION, mfaToken: undefined } },
    ],
  ])('holds nothing without a lookup when %s', async (_label, overrides) => {
    const getPasskeyWrap = rejectWith(ERRNO.PASSKEY_WRAP_NOT_FOUND);
    const { run, sensitiveDataClient } = stash(getPasskeyWrap, overrides);

    await run;

    expect(getPasskeyWrap).not.toHaveBeenCalled();
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });

  it('holds nothing when the page was left while the lookup was pending', async () => {
    const mounted = { current: true };
    const getPasskeyWrap = jest.fn().mockImplementation(async () => {
      mounted.current = false;
      throw Object.assign(new Error('nope'), {
        errno: ERRNO.PASSKEY_WRAP_NOT_FOUND,
      });
    });
    const { run, sensitiveDataClient } = stash(getPasskeyWrap, { mounted });

    await run;

    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });
});
