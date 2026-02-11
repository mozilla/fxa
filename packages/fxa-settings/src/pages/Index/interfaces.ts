/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../lib/types';
import { Integration } from '../../models';
import { QueryParams } from '../../index';
import { UseFxAStatusResult } from '../../lib/hooks/useFxAStatus';

export type IndexIntegration = Pick<
  Integration,
  | 'type'
  | 'isSync'
  | 'getClientId'
  | 'isFirefoxClientServiceRelay'
  | 'isFirefoxClientServiceAiWindow'
  | 'isFirefoxNonSync'
  | 'data'
  | 'getCmsInfo'
  | 'getLegalTerms'
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
}

export interface IndexFormData {
  email: string;
}
