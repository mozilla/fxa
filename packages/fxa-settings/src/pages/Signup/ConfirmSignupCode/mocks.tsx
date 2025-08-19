/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import ConfirmSignupCode from '.';
import {
  IntegrationType,
  OAuthNativeClients,
  OAuthNativeIntegration,
  OAuthNativeServices,
  OAuthWebIntegration,
  RelierClientInfo,
  WebIntegration,
} from '../../../models';
import {
  MOCK_CLIENT_ID,
  MOCK_EMAIL,
  MOCK_FLOW_ID,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_REDIRECT_URI,
  MOCK_SERVICE,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_UNWRAP_BKEY,
  MOCK_CMS_INFO,
  mockFinishOAuthFlowHandler,
} from '../../mocks';
import {
  ConfirmSignupCodeBaseIntegration,
  ConfirmSignupCodeIntegration,
  ConfirmSignupCodeOAuthIntegration,
} from './interfaces';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { MozServices } from '../../../lib/types';
import { GenericData } from '../../../lib/model-data';
import { Constants } from '../../../lib/constants';

export const MOCK_AUTH_ERROR = {
  errno: 999,
  message: 'Something broke',
};

export const MOCK_AUTH_ERROR_INVALID_CODE = {
  errno: 183,
  message: 'Invalid or expired confirmation code',
};

export const MOCK_AUTH_ERROR_RATE_LIMIT = {
  errno: 114,
  message: 'Client has sent too many requests',
};
export const MOCK_SIGNUP_CODE = '123456';

export function createMockWebIntegration({
  redirectTo = undefined,
}: {
  redirectTo?: string;
} = {}): ConfirmSignupCodeBaseIntegration {
  // Leaving for historical record. Remove once baked.
  // return {
  //   type: IntegrationType.Web,
  //   data: new WebIntegrationData(
  //     new GenericData({
  //       uid: MOCK_UID,
  //       context: Constants.FX_DESKTOP_V3_CONTEXT,
  //       redirect_to: redirectTo,
  //     })
  //   ),
  //   getService: () => MozServices.Default,
  //   getClientId: () => undefined,
  //   isFirefoxClientServiceRelay: () => false,
  // };

  const integration = new WebIntegration(
    new GenericData({
      uid: MOCK_UID,
      context: Constants.FX_DESKTOP_V3_CONTEXT,
      redirect_to: redirectTo,
      service: MozServices.Default,
    })
  );

  // only run assertions in tests - avoids issues with mocks shared with storybook
  if (typeof expect !== 'undefined') {
    expect(integration.type).toEqual(IntegrationType.Web);
    expect(integration.getService()).toEqual(MozServices.Default);
    expect(integration.getClientId()).toBeUndefined();
    expect(integration.isFirefoxClientServiceRelay()).toBeFalsy();
    expect(integration.isSync()).toBeFalsy();
  }

  return integration;
}

export function createMockOAuthWebIntegration(
  serviceName = MOCK_SERVICE
): ConfirmSignupCodeOAuthIntegration {
  // Keeping previous mock for reference... Now we mock the data and use the actual integration.
  // return {
  //   type: IntegrationType.OAuthWeb,
  //   data: new OAuthIntegrationData(
  //     new GenericData({ uid: MOCK_UID, redirect_to: undefined })
  //   ),
  //   getRedirectUri: () => MOCK_REDIRECT_URI,
  //   getService: () => serviceName,
  //   getClientId: () => MOCK_CLIENT_ID,
  //   wantsTwoStepAuthentication: () => false,
  //   isSync: () => false,
  //   getPermissions: () => [],
  //   isFirefoxClientServiceRelay: () => false,
  // };

  const integration = new OAuthWebIntegration(
    new GenericData({
      uid: MOCK_UID,
      service: serviceName,
      client_id: MOCK_CLIENT_ID,
      scope: 'profile:email',
    }),
    new GenericData({}),
    {
      scopedKeysEnabled: false,
      scopedKeysValidation: {},
      isPromptNoneEnabled: false,
      isPromptNoneEnabledClientIds: [],
    }
  );

  integration.clientInfo = {
    redirectUri: MOCK_REDIRECT_URI,
  } as RelierClientInfo;

  integration.cmsInfo = MOCK_CMS_INFO;

  if (typeof expect !== 'undefined') {
    expect(integration.type).toEqual(IntegrationType.OAuthWeb);
    expect(integration.getRedirectUri()).toEqual(MOCK_REDIRECT_URI);
    expect(integration.getService()).toEqual(serviceName);
    expect(integration.getClientId()).toEqual(MOCK_CLIENT_ID);
    expect(integration.wantsTwoStepAuthentication()).toEqual(false);
    expect(integration.isSync()).toEqual(false);
    expect(integration.getPermissions()).toEqual(['profile:email']);
    expect(integration.isFirefoxClientServiceRelay()).toEqual(false);
  }

  return integration;
}

export function createMockOAuthNativeIntegration(
  isSync = true
): ConfirmSignupCodeOAuthIntegration {
  // Keeping previous mock for reference... Now we mock the data and use an actual integration.
  // return {
  //   type: IntegrationType.OAuthNative,
  //   data: new OAuthIntegrationData(
  //     new GenericData({ uid: MOCK_UID, redirect_to: undefined })
  //   ),
  //   getRedirectUri: () => MOCK_REDIRECT_URI,
  //   getService: () => OAuthNativeClients.FirefoxDesktop,
  //   getClientId: () => MOCK_CLIENT_ID,
  //   wantsTwoStepAuthentication: () => false,
  //   isSync: () => isSync,
  //   getPermissions: () => [],
  //   isFirefoxClientServiceRelay: () => !isSync,
  // };

  const integration = new OAuthNativeIntegration(
    new GenericData({
      scope: 'profile:email',
      service: isSync ? OAuthNativeServices.Sync : OAuthNativeServices.Relay,
      uid: MOCK_UID,
      redirect_uri: MOCK_REDIRECT_URI,
      client_id: MOCK_CLIENT_ID,
    }),
    new GenericData({}),
    {
      scopedKeysEnabled: false,
      scopedKeysValidation: {},
      isPromptNoneEnabled: false,
      isPromptNoneEnabledClientIds: [],
    }
  );

  if (isSync) {
    integration.clientInfo = {
      redirectUri: MOCK_REDIRECT_URI,
      clientId: OAuthNativeClients.FirefoxDesktop,
    } as RelierClientInfo;
  } else {
    integration.clientInfo = {
      redirectUri: MOCK_REDIRECT_URI,
      clientId: OAuthNativeClients.FirefoxDesktop,
    } as RelierClientInfo;
  }

  if (typeof expect !== 'undefined') {
    expect(integration.type).toEqual(IntegrationType.OAuthNative);
    expect(integration.getRedirectUri()).toEqual(MOCK_REDIRECT_URI);
    expect(integration.getService()).toEqual(
      isSync ? OAuthNativeServices.Sync : OAuthNativeServices.Relay
    );
    expect(integration.getClientId()).toEqual(MOCK_CLIENT_ID);
    expect(integration.wantsTwoStepAuthentication()).toEqual(false);
    expect(integration.isSync()).toEqual(isSync);
    expect(integration.getPermissions()).toEqual(['profile:email']);
    expect(integration.isFirefoxClientServiceRelay()).toEqual(!isSync);
  }

  return integration;
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
