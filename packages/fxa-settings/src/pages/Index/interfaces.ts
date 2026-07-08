/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import { MozServices } from '../../lib/types';
import { Integration } from '../../models';
import { QueryParams } from '../../index';
import { UseFxAStatusResult } from '../../lib/hooks/useFxAStatus';
import { FinishOAuthFlowHandler } from '../../lib/oauth/hooks';

export type IndexIntegration = Pick<
  Integration,
  | 'type'
  | 'isSync'
  | 'isDesktopSync'
  | 'getClientId'
  | 'getService'
  | 'isFirefoxClient'
  | 'isFirefoxClientServiceRelay'
  | 'isFirefoxClientServiceSmartWindow'
  | 'isFirefoxClientServiceVpn'
  | 'isFirefoxDesktopClient'
  | 'isFirefoxMobileClient'
  | 'isFirefoxNonSync'
  | 'data'
  | 'getCmsInfo'
  | 'getLegalTerms'
  | 'getWebChannelServices'
  | 'requiresKeys'
  | 'wantsKeys'
  | 'wantsKeysIfPasswordEntered'
  | 'requiresPasswordForLogin'
  | 'nonSyncKeysRequirePassword'
  | 'supportsKeylessLogin'
  | 'allowsPreKeysSyncLogin'
  | 'wantsLogin'
  | 'wantsTwoStepAuthentication'
>;

export interface IndexContainerProps {
  integration: IndexIntegration;
  serviceName: MozServices;
  flowQueryParams?: QueryParams;
  useFxAStatusResult: UseFxAStatusResult;
  setCurrentSplitLayout?: (value: boolean) => void;
}

export interface LocationState {
  prefillEmail?: string;
  deleteAccountSuccess?: boolean;
  hasBounced?: boolean;
  localizedErrorFromLocationState?: string;
}

export interface IndexProps extends LocationState {
  integration: IndexIntegration;
  serviceName: MozServices;
  processEmailSubmission: (email: string) => Promise<void>;
  setErrorBannerMessage: React.Dispatch<React.SetStateAction<string>>;
  setSuccessBannerMessage: React.Dispatch<React.SetStateAction<string>>;
  setTooltipErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  errorBannerMessage?: string;
  successBannerMessage?: string;
  tooltipErrorMessage?: string;
  flowQueryParams?: QueryParams;
  isMobile: boolean;
  useFxAStatusResult: UseFxAStatusResult;
  setCurrentSplitLayout?: (value: boolean) => void;
  authClient: AuthClient;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  /** Cancel pending auto-submit so it can't override a user-chosen navigation. */
  disableAutoSubmit: () => void;
}

export interface IndexFormData {
  email: string;
}
