/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseIntegration, IntegrationType } from '../../../models';

export interface ResetPasswordWithRecoveryKeyVerifiedIntegration {
  type: IntegrationType;
  getServiceName: () => ReturnType<BaseIntegration['getServiceName']>;
  isSync: () => ReturnType<BaseIntegration['isSync']>;
}

export interface ResetPasswordWithRecoveryKeyVerifiedProps {
  isSignedIn: boolean;
  integration: ResetPasswordWithRecoveryKeyVerifiedIntegration;
}
