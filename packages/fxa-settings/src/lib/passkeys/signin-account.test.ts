/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { resolveSignedInAccount } from './signin-account';
import type { PasskeySignInIntegration } from './signin-flow';
import { storeAccountData } from '../storage-utils';
import { ensureCanLinkAcountOrRedirect } from '../../pages/Signin/utils';

jest.mock('../../pages/Signin/utils', () => ({
  __esModule: true,
  ensureCanLinkAcountOrRedirect: jest.fn(),
}));

jest.mock('../storage-utils', () => ({
  __esModule: true,
  storeAccountData: jest.fn(),
}));

const EMAIL = 'user@example.com';
const COMPLETION = {
  uid: 'uid-123',
  sessionToken: 'session-token',
  verified: true,
  hasPassword: true,
};
const ftlMsgResolver = {} as FtlMsgResolver;
const navigateWithQuery = jest.fn();

const integration = (overrides: Record<string, unknown> = {}) =>
  ({
    isSync: () => false,
    isFirefoxNonSync: () => false,
    ...overrides,
  }) as unknown as PasskeySignInIntegration;

const accountClient = (response: unknown) => ({
  account: jest.fn().mockResolvedValue(response),
});

const resolve = (
  response: unknown,
  integrationOverrides: Record<string, unknown> = {}
) =>
  resolveSignedInAccount({
    authClient: accountClient(response),
    integration: integration(integrationOverrides),
    completion: COMPLETION,
    ftlMsgResolver,
    navigateWithQuery,
  });

beforeEach(() => {
  jest.clearAllMocks();
  (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(true);
});

describe('resolveSignedInAccount', () => {
  it('persists the session and returns the primary email', async () => {
    const result = await resolve({
      emails: [
        { email: 'old@example.com', isPrimary: false, verified: true },
        { email: EMAIL, isPrimary: true, verified: true },
      ],
    });

    expect(result).toEqual({ email: EMAIL, accountHasTotp: false });
    expect(storeAccountData).toHaveBeenCalledWith({
      email: EMAIL,
      uid: COMPLETION.uid,
      lastLogin: expect.any(Number),
      sessionToken: COMPLETION.sessionToken,
      verified: true,
      sessionVerified: true,
      hasPassword: true,
    });
    expect(ensureCanLinkAcountOrRedirect).not.toHaveBeenCalled();
  });

  // Must read `verified`, not `exists`, to gate on completed enrolment.
  it.each([
    ['no TOTP record', undefined, false],
    ['TOTP not enrolled', { exists: false, verified: false }, false],
    ['TOTP enrolled but unverified', { exists: true, verified: false }, false],
    ['TOTP enrolled and verified', { exists: true, verified: true }, true],
  ])('reports accountHasTotp=%s for %s', async (_label, totp, expected) => {
    const result = await resolve({
      emails: [{ email: EMAIL, isPrimary: true, verified: true }],
      ...(totp !== undefined && { totp }),
    });

    expect(result?.accountHasTotp).toBe(expected);
  });

  it('throws without persisting when the account has no primary email', async () => {
    await expect(resolve({ emails: [] })).rejects.toThrow(
      'Authenticated account response missing email'
    );
    expect(storeAccountData).not.toHaveBeenCalled();
  });

  it.each([
    ['Sync', { isSync: () => true }],
    ['a Firefox service', { isFirefoxNonSync: () => true }],
  ])(
    'runs the merge gate for %s before persisting',
    async (_label, overrides) => {
      await resolve(
        { emails: [{ email: EMAIL, isPrimary: true, verified: true }] },
        overrides
      );

      expect(ensureCanLinkAcountOrRedirect).toHaveBeenCalledWith({
        email: EMAIL,
        uid: COMPLETION.uid,
        ftlMsgResolver,
        navigateWithQuery,
      });
      expect(storeAccountData).toHaveBeenCalled();
    }
  );

  it('returns undefined and leaves no session when the user declines the merge', async () => {
    (ensureCanLinkAcountOrRedirect as jest.Mock).mockResolvedValue(false);

    const result = await resolve(
      { emails: [{ email: EMAIL, isPrimary: true, verified: true }] },
      { isSync: () => true }
    );

    expect(result).toBeUndefined();
    expect(storeAccountData).not.toHaveBeenCalled();
  });
});
