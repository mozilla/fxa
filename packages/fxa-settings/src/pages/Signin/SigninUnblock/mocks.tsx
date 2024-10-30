/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../../lib/types';
import { IntegrationType } from '../../../models';
import { MOCK_EMAIL, MOCK_AUTH_PW } from '../../mocks';
import { SigninOAuthIntegration } from '../interfaces';

export { CREDENTIAL_STATUS_MUTATION, BEGIN_SIGNIN_MUTATION } from '../gql';

export const MOCK_SIGNIN_UNBLOCK_LOCATION_STATE = {
  email: MOCK_EMAIL,
  hasLinkedAccount: false,
  hasPassword: true,
  authPW: MOCK_AUTH_PW,
};

export function createMockSigninWebSyncIntegration() {
  return {
    type: IntegrationType.SyncDesktopV3,
    isSync: () => true,
    getService: () => MozServices.FirefoxSync,
    getClientId: () => undefined,
    wantsKeys: () => true,
    wantsTwoStepAuthentication: () => false,
    data: {},
    isDesktopSync: () => true,
    isDesktopRelay: () => false,
    wantsLogin: () => false,
  };
}
