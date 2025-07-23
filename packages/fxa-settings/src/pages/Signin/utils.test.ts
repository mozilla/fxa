/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
} from '../mocks';
import { NavigationOptions } from './interfaces';
import { createMockSigninOAuthNativeSyncIntegration } from './mocks';
import { handleNavigation } from './utils';
import * as ReachRouter from '@reach/router';
import * as ReactUtils from 'fxa-react/lib/utils';

jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  navigate: jest.fn(),
}));

const navigateSpy = jest.spyOn(ReachRouter, 'navigate');
const hardNavigateSpy = jest.spyOn(ReactUtils, 'hardNavigate');

describe('Signin utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleNavigation', () => {
    it('does not navigate if performNavigation is false', async () => {
      const navigationOptions = {
        email: MOCK_EMAIL,
        signinData: {
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          verified: true,
          verificationMethod: VerificationMethods.EMAIL,
          verificationReason: VerificationReasons.SIGN_IN,
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        },
        integration: createMockSigninOAuthNativeSyncIntegration({
          isMobile: true,
        }),
        redirectTo: '',
        finishOAuthFlowHandler: jest
          .fn()
          .mockReturnValue(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
        queryParams: '',
        performNavigation: false,
      } as NavigationOptions;
      const { error } = await handleNavigation(navigationOptions);

      expect(error).toBeUndefined();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(hardNavigateSpy).not.toHaveBeenCalled();
    });
  });
});
