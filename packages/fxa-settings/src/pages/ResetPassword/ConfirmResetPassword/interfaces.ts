/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MetricsContext } from 'fxa-auth-client/browser';
import { ResendStatus } from '../../../lib/types';

export interface ConfirmResetPasswordLocationState {
  email: string;
  metricsContext: MetricsContext;
}

export type RecoveryKeyCheckResult = {
  exists?: boolean;
  hint?: string;
  estimatedSyncDeviceCount?: number;
};

export type ConfirmResetPasswordProps = {
  clearBanners?: () => void;
  email: string;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  resendCode: () => Promise<void>;
  resendStatus: ResendStatus;
  resendErrorMessage: string;
  verifyCode: (code: string) => Promise<void>;
};
