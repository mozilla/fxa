/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { MemoryRouter } from 'react-router';
import { MozServices } from '../../lib/types';
import {
  IntegrationData,
  IntegrationType,
  OAuthIntegrationData,
  OAuthWebIntegration,
  RelierCmsInfo,
} from '../../models';
import type AuthClient from 'fxa-auth-client/browser';
import { IndexIntegration } from './interfaces';
import Index from '.';
import { MOCK_CLIENT_ID } from '../mocks';
import { Constants } from '../../lib/constants';
import { GenericData } from '../../lib/model-data';
import { mockUseFxAStatus } from '../../lib/hooks/useFxAStatus/mocks';

export function createMockIndexOAuthIntegration({
  clientId = MOCK_CLIENT_ID,
}): IndexIntegration {
  // Leaving for historical record. Remove once baked.
  // return {
  //   type: IntegrationType.OAuthWeb,
  //   isSync: () => false,
  //   getClientId: () => clientId,
  //   isFirefoxClientServiceRelay: () => false,
  //   data: new OAuthIntegrationData(
  //     new GenericData({
  //       context: '',
  //     })
  //   ),
  // };

  return new OAuthWebIntegration(
    new GenericData({
      context: '',
      service: '',
      client_id: clientId,
    }),
    new GenericData({}),
    {
      isPromptNoneEnabled: false,
      isPromptNoneEnabledClientIds: [],
      scopedKeysEnabled: false,
      scopedKeysValidation: {},
    }
  );
}
export function createMockIndexOAuthNativeIntegration({
  isSync = true,
  isFirefoxClientServiceRelay = false,
  isFirefoxClientServiceSmartWindow = false,
  isFirefoxClientServiceVpn = false,
  cmsInfo,
}: {
  isSync?: boolean;
  isFirefoxClientServiceRelay?: boolean;
  isFirefoxClientServiceSmartWindow?: boolean;
  isFirefoxClientServiceVpn?: boolean;
  cmsInfo?: RelierCmsInfo;
} = {}): IndexIntegration {
  return {
    type: IntegrationType.OAuthNative,
    isSync: () => isSync,
    isDesktopSync: () => isSync,
    getClientId: () => MOCK_CLIENT_ID,
    getService: () => MOCK_CLIENT_ID,
    isFirefoxClient: () => true,
    isFirefoxClientServiceRelay: () => isFirefoxClientServiceRelay,
    isFirefoxClientServiceSmartWindow: () => isFirefoxClientServiceSmartWindow,
    isFirefoxClientServiceVpn: () => isFirefoxClientServiceVpn,
    isFirefoxDesktopClient: () => false,
    isFirefoxMobileClient: () => false,
    isFirefoxNonSync: () =>
      isFirefoxClientServiceRelay ||
      isFirefoxClientServiceSmartWindow ||
      isFirefoxClientServiceVpn,
    supportsKeylessLogin(b: boolean) {
      return b && this.isFirefoxNonSync();
    },
    allowsPreKeysSyncLogin: () => false,
    nonSyncKeysRequirePassword(b: boolean) {
      return !b && this.wantsKeysIfPasswordEntered();
    },
    getCmsInfo: () => cmsInfo,
    getLegalTerms: () => undefined,
    getWebChannelServices: () => undefined,
    requiresKeys: () => false,
    wantsKeys: () => false,
    wantsKeysIfPasswordEntered: () => false,
    requiresPasswordForLogin: () => false,
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
    data: new OAuthIntegrationData(
      new GenericData({
        context: Constants.OAUTH_WEBCHANNEL_CONTEXT,
      })
    ),
  };
}

export function createMockIndexWebIntegration(): IndexIntegration {
  return {
    type: IntegrationType.Web,
    isSync: () => false,
    isDesktopSync: () => false,
    getClientId: () => undefined,
    getService: () => undefined,
    isFirefoxClient: () => false,
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => false,
    isFirefoxDesktopClient: () => false,
    isFirefoxMobileClient: () => false,
    isFirefoxNonSync: () => false,
    supportsKeylessLogin(b: boolean) {
      return b && this.isFirefoxNonSync();
    },
    allowsPreKeysSyncLogin: () => false,
    nonSyncKeysRequirePassword(b: boolean) {
      return !b && this.wantsKeysIfPasswordEntered();
    },
    getCmsInfo: () => undefined,
    getLegalTerms: () => undefined,
    getWebChannelServices: () => undefined,
    requiresKeys: () => false,
    wantsKeys: () => false,
    wantsKeysIfPasswordEntered: () => false,
    requiresPasswordForLogin: () => false,
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
    data: new IntegrationData(
      new GenericData({
        context: '',
      })
    ),
  };
}

export const Subject = ({
  integration = createMockIndexWebIntegration(),
  serviceName = MozServices.Default,
  prefillEmail,
  initialErrorBanner = '',
  initialSuccessBanner = '',
  initialTooltipMessage = '',
  isMobile = false,
  browserSupportsKeysOptional = false,
}: {
  integration?: IndexIntegration;
  serviceName?: MozServices;
  prefillEmail?: string;
  initialErrorBanner?: string;
  initialSuccessBanner?: string;
  initialTooltipMessage?: string;
  isMobile?: boolean;
  browserSupportsKeysOptional?: boolean;
}) => {
  const [errorBannerMessage, setErrorBannerMessage] =
    React.useState(initialErrorBanner);
  const [successBannerMessage, setSuccessBannerMessage] =
    React.useState(initialSuccessBanner);
  const [tooltipErrorMessage, setTooltipErrorMessage] = React.useState(
    initialTooltipMessage
  );
  const mockUseFxAStatusResult = mockUseFxAStatus({
    browserSupportsKeysOptional,
  });
  return (
    <MemoryRouter>
      <Index
        processEmailSubmission={async () => {}}
        disableAutoSubmit={() => {}}
        authClient={
          {
            beginPasskeyAuthentication: async () => {},
            completePasskeyAuthentication: async () => {},
            accountProfile: async () => {},
          } as unknown as AuthClient
        }
        finishOAuthFlowHandler={async () => ({
          redirect: 'http://example.com',
          code: 'mock-code',
          state: 'mock-state',
          scope: 'profile',
          error: undefined,
        })}
        {...{
          prefillEmail,
          integration,
          serviceName,
          errorBannerMessage,
          successBannerMessage,
          tooltipErrorMessage,
          setErrorBannerMessage,
          setSuccessBannerMessage,
          setTooltipErrorMessage,
          isMobile,
          useFxAStatusResult: mockUseFxAStatusResult,
        }}
      />
    </MemoryRouter>
  );
};
