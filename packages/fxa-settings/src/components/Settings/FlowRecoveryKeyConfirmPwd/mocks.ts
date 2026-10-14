/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import { AuthUiError } from '../../../lib/auth-errors/auth-errors';
import { Account } from '../../../models';
import { MOCK_ACCOUNT } from '../../../models/mocks';

export const MOCK_RECOVERY_KEY_JWT = 'mock-jwt';

export const mockAccountWithoutRecoveryKey = {
  ...MOCK_ACCOUNT,
  recoveryKey: { exists: false },
  getCachedJwtByScope: () => MOCK_RECOVERY_KEY_JWT,
} as unknown as Account;

export const mockAccountWithRecoveryKey = {
  ...MOCK_ACCOUNT,
  recoveryKey: { exists: true },
  getCachedJwtByScope: () => MOCK_RECOVERY_KEY_JWT,
} as unknown as Account;

export const mockRecoveryKeyAuthClient = (reauthError?: AuthUiError) =>
  ({
    accountEmails: () =>
      Promise.resolve({
        primary: MOCK_ACCOUNT.primaryEmail.email,
        original: MOCK_ACCOUNT.primaryEmail.email,
      }),
    sessionReauth: () =>
      reauthError
        ? Promise.reject(reauthError)
        : Promise.resolve({ keyFetchToken: 'kft', unwrapBKey: 'ubk' }),
    accountKeys: () => Promise.resolve({ kA: 'kA', kB: 'kB' }),
    createRecoveryKeyWithJwt: () => Promise.resolve({}),
  }) as unknown as AuthClient;
