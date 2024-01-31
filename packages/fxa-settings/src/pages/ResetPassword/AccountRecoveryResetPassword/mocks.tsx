/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account, IntegrationType } from '../../../models';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import {
  MOCK_EMAIL,
  MOCK_REDIRECT_URI,
  MOCK_SERVICE,
  MOCK_UID,
} from '../../mocks';
import {
  AccountRecoveryResetPasswordBaseIntegration,
  AccountRecoveryResetPasswordOAuthIntegration,
} from './interfaces';

export const MOCK_SEARCH_PARAMS = {
  email: MOCK_EMAIL,
  emailToHashWith: 'blabidi@blabidiboo.com',
  code: '123abc',
  token: '123abc',
  uid: MOCK_UID,
};

// TODO: better mocking here. LinkValidator sends `params` into page components and
// we mock those params sent to page components... we want to do these validation
// checks in the container component instead.
export const MOCK_VERIFICATION_INFO = {
  email: MOCK_EMAIL,
  emailToHashWith: 'blabidi@blabidiboo.com',
};

export const MOCK_LOCATION_STATE = {
  kB: '123',
  accountResetToken: '123',
  recoveryKeyId: '123',
};

export function mockAccount() {
  return {
    ...MOCK_ACCOUNT,
    setLastLogin: () => {},
    resetPasswordWithRecoveryKey: () => {},
    resetPassword: () => {},
    isSessionVerified: () => true,
  } as unknown as Account;
}

export const MOCK_RESET_DATA = {
  authAt: 12345,
  keyFetchToken: 'keyFetchToken',
  sessionToken: 'sessionToken',
  unwrapBKey: 'unwrapBKey',
  verified: true,
};

export function createMockAccountRecoveryResetPasswordOAuthIntegration(
  serviceName = MOCK_SERVICE,
  isSync = false
): AccountRecoveryResetPasswordOAuthIntegration {
  return {
    type: IntegrationType.OAuth,
    data: {
      uid: MOCK_UID,
      resetPasswordConfirm: false,
    },
    getRedirectUri: () => MOCK_REDIRECT_URI,
    getService: () => serviceName,
    isSync: () => isSync,
  };
}

export function createMockSyncDesktopV3Integration(): AccountRecoveryResetPasswordBaseIntegration {
  return {
    type: IntegrationType.SyncDesktopV3,
    data: {
      uid: MOCK_UID,
      resetPasswordConfirm: false,
    },
  };
}
