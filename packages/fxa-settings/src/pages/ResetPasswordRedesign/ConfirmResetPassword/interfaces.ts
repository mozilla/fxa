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
  estimatedSyncDeviceCount?: number;
};

export type ConfirmResetPasswordProps = {
  email: string;
  errorMessage: string;
  resendCode: () => Promise<boolean>;
  resendStatus: ResendStatus;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setResendStatus: React.Dispatch<React.SetStateAction<ResendStatus>>;
  verifyCode: (code: string) => Promise<void>;
};
