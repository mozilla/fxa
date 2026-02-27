/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { MozServices } from '../../lib/types';
import {
  IntegrationData,
  IntegrationType,
  OAuthIntegrationData,
  OAuthWebIntegration,
  RelierCmsInfo,
} from '../../models';
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
    getClientId: () => MOCK_CLIENT_ID,
    getService: () => MOCK_CLIENT_ID,
    wantsKeys: () => false,
    isFirefoxClientServiceRelay: () => isFirefoxClientServiceRelay,
    isFirefoxClientServiceSmartWindow: () => isFirefoxClientServiceSmartWindow,
    isFirefoxClientServiceVpn: () => isFirefoxClientServiceVpn,
    isFirefoxNonSync: () =>
      isFirefoxClientServiceRelay ||
      isFirefoxClientServiceSmartWindow ||
      isFirefoxClientServiceVpn,
    getCmsInfo: () => cmsInfo,
    getLegalTerms: () => undefined,
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
    getClientId: () => undefined,
    getService: () => undefined,
    wantsKeys: () => false,
    isFirefoxClientServiceRelay: () => false,
    isFirefoxClientServiceSmartWindow: () => false,
    isFirefoxClientServiceVpn: () => false,
    isFirefoxNonSync: () => false,
    getCmsInfo: () => undefined,
    getLegalTerms: () => undefined,
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
  supportsKeysOptionalLogin = false,
}: {
  integration?: IndexIntegration;
  serviceName?: MozServices;
  prefillEmail?: string;
  initialErrorBanner?: string;
  initialSuccessBanner?: string;
  initialTooltipMessage?: string;
  isMobile?: boolean;
  supportsKeysOptionalLogin?: boolean;
}) => {
  const [errorBannerMessage, setErrorBannerMessage] =
    React.useState(initialErrorBanner);
  const [successBannerMessage, setSuccessBannerMessage] =
    React.useState(initialSuccessBanner);
  const [tooltipErrorMessage, setTooltipErrorMessage] = React.useState(
    initialTooltipMessage
  );
  const mockUseFxAStatusResult = mockUseFxAStatus({
    supportsKeysOptionalLogin,
  });
  return (
    <LocationProvider>
      <Index
        processEmailSubmission={async () => { }}
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
    </LocationProvider>
  );
};
