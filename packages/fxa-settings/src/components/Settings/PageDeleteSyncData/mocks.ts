/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import { AuthUiError } from '../../../lib/auth-errors/auth-errors';
import { MOCK_ACCOUNT } from '../../../models/mocks';

export const mockDeleteSyncDataAuthClient = (reauthError?: AuthUiError) =>
  ({
    accountEmails: () =>
      Promise.resolve({
        primary: MOCK_ACCOUNT.primaryEmail.email,
        original: MOCK_ACCOUNT.primaryEmail.email,
      }),
    sessionReauth: () =>
      reauthError ? Promise.reject(reauthError) : Promise.resolve({}),
  }) as unknown as AuthClient;
