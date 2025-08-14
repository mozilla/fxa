/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import Signup from '.';
import { MozServices } from '../../lib/types';
import { IntegrationType, RelierCmsInfo } from '../../models/integrations';
import {
  MOCK_REDIRECT_URI,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
  MOCK_AUTH_AT,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_SESSION_TOKEN,
  MOCK_EMAIL,
  MOCK_CLIENT_ID,
} from '../mocks';
import {
  BeginSignupHandler,
  SignupBaseIntegration,
  SignupIntegration,
  SignupOAuthIntegration,
} from './interfaces';
import { mockUseSyncEngines } from '../../lib/hooks/useSyncEngines/mocks';

export function createMockSignupWebIntegration(): SignupBaseIntegration {
  return {
    type: IntegrationType.Web,
    getService: () => undefined,
    getClientId: () => undefined,
    isSync: () => false,
    isFirefoxClientServiceRelay: () => false,
    wantsKeys: () => false,
    getCmsInfo: () => undefined,
  };
}

export function createMockSignupSyncDesktopV3Integration(): SignupBaseIntegration {
  return {
    type: IntegrationType.SyncDesktopV3,
    getService: () => 'sync',
    getClientId: () => undefined,
    isSync: () => true,
    isFirefoxClientServiceRelay: () => false,
    wantsKeys: () => false,
    getCmsInfo: () => undefined,
  };
}

export function createMockSignupOAuthWebIntegration(
  clientId?: string,
  service?: MozServices,
  cmsInfo?: RelierCmsInfo
): SignupOAuthIntegration {
  return {
    type: IntegrationType.OAuthWeb,
    getRedirectUri: () => MOCK_REDIRECT_URI,
    saveOAuthState: () => {},
    getService: () => service || MozServices.Default,
    getClientId: () => clientId || MOCK_CLIENT_ID,
    isSync: () => false,
    isFirefoxClientServiceRelay: () => false,
    wantsKeys: () => false,
    getCmsInfo: () => cmsInfo,
  };
}

export function createMockSignupOAuthNativeIntegration(
  service?: string,
  isSync = true,
  cmsInfo?: RelierCmsInfo
): SignupOAuthIntegration {
  return {
    type: IntegrationType.OAuthNative,
    getRedirectUri: () => MOCK_REDIRECT_URI,
    saveOAuthState: () => {},
    getService: () => service,
    getClientId: () => MOCK_CLIENT_ID,
    isSync: () => isSync,
    isFirefoxClientServiceRelay: () => !isSync,
    wantsKeys: () => true,
    getCmsInfo: () => cmsInfo,
  };
}

export const BEGIN_SIGNUP_HANDLER_RESPONSE = {
  data: {
    signUp: {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      authAt: MOCK_AUTH_AT,
      keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    },
    unwrapBKey: MOCK_UNWRAP_BKEY,
  },
};

export const BEGIN_SIGNUP_HANDLER_RESPONSE_UNDER_18 = {
  data: {
    signUp: {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      authAt: MOCK_AUTH_AT,
      keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    },
    unwrapBKey: MOCK_UNWRAP_BKEY,
  },
};

export const BEGIN_SIGNUP_HANDLER_FAIL_RESPONSE = {
  error: {
    errno: 0,
    message: 'wham bam thank you Sam',
    ftlId: '',
  },
};

export const mockBeginSignupHandler: BeginSignupHandler = () =>
  Promise.resolve(BEGIN_SIGNUP_HANDLER_RESPONSE);

export const signupQueryParams = {
  email: MOCK_EMAIL,
};

export const signupQueryParamsWithContent = {
  ...signupQueryParams,
  emailStatusChecked: 'true',
};

export const Subject = ({
  integration = createMockSignupWebIntegration(),
  beginSignupHandler = mockBeginSignupHandler,
  email = MOCK_EMAIL,
  isMobile = false,
}: {
  email?: string;
  integration?: SignupIntegration;
  beginSignupHandler?: BeginSignupHandler;
  isMobile?: boolean;
}) => {
  const mockUseSyncEnginesResult = mockUseSyncEngines();
  return (
    <LocationProvider>
      <Signup
        {...{
          integration,
          beginSignupHandler,
          useSyncEnginesResult: mockUseSyncEnginesResult,
          email,
          isMobile,
        }}
      />
    </LocationProvider>
  );
};
