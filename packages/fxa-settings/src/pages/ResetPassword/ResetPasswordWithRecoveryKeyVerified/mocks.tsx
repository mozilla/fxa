/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../../lib/types';
import { IntegrationType } from '../../../models';
import { ResetPasswordWithRecoveryKeyVerifiedIntegration } from './interfaces';

export function createMockResetPasswordWithRecoveryKeyVerifiedWebIntegration(): ResetPasswordWithRecoveryKeyVerifiedIntegration {
  return {
    type: IntegrationType.Web,
    getServiceName: () => MozServices.Default,
    isSync: () => false,
  };
}

export function createMockSyncDesktopV3Integration(): ResetPasswordWithRecoveryKeyVerifiedIntegration {
  return {
    type: IntegrationType.SyncDesktopV3,
    getServiceName: () => MozServices.FirefoxSync,
    isSync: () => true,
  };
}
