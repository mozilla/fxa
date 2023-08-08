/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../lib/types';
import { IntegrationType } from '../../models';
import {
  MOCK_REDIRECT_URI,
  MOCK_SERVICE,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
  MOCK_AUTH_AT,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
} from '../mocks';
import {
  BeginSignupHandler,
  SignupBaseIntegration,
  SignupOAuthIntegration,
} from './interfaces';

export function createMockSignupWebIntegration(): SignupBaseIntegration {
  return {
    type: IntegrationType.Web,
    getServiceName: () => Promise.resolve(MozServices.Default),
  };
}

export function createMockSignupSyncDesktopIntegration(): SignupBaseIntegration {
  return {
    type: IntegrationType.SyncDesktop,
    getServiceName: () => Promise.resolve(MozServices.FirefoxSync),
  };
}

export function createMockSignupOAuthIntegration(
  serviceName = MOCK_SERVICE
): SignupOAuthIntegration {
  return {
    type: IntegrationType.OAuth,
    getRedirectUri: () => MOCK_REDIRECT_URI,
    saveOAuthState: () => {},
    getServiceName: () => Promise.resolve(serviceName),
  };
}

export const mockBeginSignupHandler: BeginSignupHandler = (
  ...args: Parameters<BeginSignupHandler>
) => {
  return Promise.resolve({
    data: {
      SignUp: {
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        authAt: MOCK_AUTH_AT,
        keyFetchToken: MOCK_KEY_FETCH_TOKEN,
      },
      unwrapBKey: MOCK_UNWRAP_BKEY,
    },
  });
};
