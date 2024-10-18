/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import ConfirmSignupCode from '.';
import { IntegrationType, OAuthNativeClients } from '../../../models';
import {
  MOCK_EMAIL,
  MOCK_FLOW_ID,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_REDIRECT_URI,
  MOCK_SERVICE,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import {
  ConfirmSignupCodeBaseIntegration,
  ConfirmSignupCodeIntegration,
  ConfirmSignupCodeOAuthIntegration,
} from './interfaces';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { MozServices } from '../../../lib/types';

export const MOCK_AUTH_ERROR = {
  errno: 999,
  message: 'Something broke',
};

export const MOCK_SIGNUP_CODE = '123456';

export function createMockWebIntegration({
  redirectTo = undefined,
}: { redirectTo?: string } = {}): ConfirmSignupCodeBaseIntegration {
  return {
    type: IntegrationType.Web,
    data: { uid: MOCK_UID, redirectTo },
    getService: () => MozServices.Default,
  };
}

export function createMockOAuthWebIntegration(
  serviceName = MOCK_SERVICE
): ConfirmSignupCodeOAuthIntegration {
  return {
    type: IntegrationType.OAuthWeb,
    data: { uid: MOCK_UID, redirectTo: undefined },
    getRedirectUri: () => MOCK_REDIRECT_URI,
    getService: () => serviceName,
    wantsTwoStepAuthentication: () => false,
    isSync: () => false,
    getPermissions: () => [],
    isDesktopRelay: () => false,
  };
}

export function createMockOAuthNativeIntegration(
  isSync = true
): ConfirmSignupCodeOAuthIntegration {
  return {
    type: IntegrationType.OAuthNative,
    data: { uid: MOCK_UID, redirectTo: undefined },
    getRedirectUri: () => MOCK_REDIRECT_URI,
    getService: () => OAuthNativeClients.FirefoxDesktop,
    wantsTwoStepAuthentication: () => false,
    isSync: () => isSync,
    getPermissions: () => [],
    isDesktopRelay: () => !isSync,
  };
}

export const Subject = ({
  integration = createMockWebIntegration(),
  newsletterSlugs,
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  offeredSyncEngines,
  declinedSyncEngines,
}: {
  integration?: ConfirmSignupCodeIntegration;
  newsletterSlugs?: string[];
  finishOAuthFlowHandler?: FinishOAuthFlowHandler;
  offeredSyncEngines?: string[];
  declinedSyncEngines?: string[];
}) => {
  return (
    <LocationProvider>
      <ConfirmSignupCode
        {...{
          integration,
          newsletterSlugs,
          finishOAuthFlowHandler,
          offeredSyncEngines,
          declinedSyncEngines,
        }}
        flowQueryParams={{ flowId: MOCK_FLOW_ID }}
        email={MOCK_EMAIL}
        keyFetchToken={MOCK_KEY_FETCH_TOKEN}
        sessionToken={MOCK_SESSION_TOKEN}
        uid={MOCK_UID}
        unwrapBKey={MOCK_UNWRAP_BKEY}
      />
    </LocationProvider>
  );
};
