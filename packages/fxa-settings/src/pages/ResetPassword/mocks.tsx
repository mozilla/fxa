/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account, IntegrationType } from '../../models';
import {
  ResetPasswordBaseIntegration,
  ResetPasswordOAuthIntegration,
} from './interfaces';
import { MozServices } from '../../lib/types';
import { MOCK_REDIRECT_URI, MOCK_SERVICE } from '../mocks';

// No error message on submit
export const mockDefaultAccount = {
  resetPassword: () =>
    Promise.resolve({ passwordForgotToken: 'mockPasswordForgotToken' }),
} as any as Account;

const throttledErrorObjWithRetryAfter = {
  errno: 114,
  retryAfter: 500,
  retryAfterLocalized: 'in 15 minutes',
};

// Mocked throttled error with retryAfter value
export const mockAccountWithThrottledError = {
  resetPassword: () => Promise.reject(throttledErrorObjWithRetryAfter),
} as unknown as Account;

const genericThrottledErrorObj = {
  errno: 114,
};

// Mocked throttled error without retryAfter value
export const mockAccountWithGenericThrottledError = {
  resetPassword: () => Promise.reject(genericThrottledErrorObj),
} as unknown as Account;

export const mockAccountWithUnexpectedError = {
  resetPassword: () => Promise.reject('some error'),
} as unknown as Account;

export function createMockResetPasswordWebIntegration(): ResetPasswordBaseIntegration {
  return {
    type: IntegrationType.Web,
    getServiceName: () => Promise.resolve(MozServices.Default),
  };
}

export function createMockResetPasswordOAuthIntegration(
  serviceName = MOCK_SERVICE
): ResetPasswordOAuthIntegration {
  return {
    type: IntegrationType.OAuth,
    getRedirectUri: () => MOCK_REDIRECT_URI,
    saveOAuthState: () => {},
    getService: () => serviceName,
    getServiceName: () => Promise.resolve(serviceName),
  };
}
