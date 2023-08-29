/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LinkStatus } from '../../../lib/types';
import { BaseIntegration, IntegrationType } from '../../../models';
import { CompleteResetPasswordLink } from '../../../models/reset-password/verification';

export interface AccountRecoveryConfirmKeyFormData {
  recoveryKey: string;
}

interface RequiredParamsAccountRecoveryConfirmKey {
  email: string;
  token: string;
  code: string;
  uid: string;
}

export type AccountRecoveryConfirmKeySubmitData = {
  recoveryKey: string;
} & RequiredParamsAccountRecoveryConfirmKey;

export interface AccountRecoveryConfirmKeyProps {
  linkModel: CompleteResetPasswordLink;
  setLinkStatus: React.Dispatch<React.SetStateAction<LinkStatus>>;
  integration: AccountRecoveryConfirmKeyBaseIntegration;
}

export interface AccountRecoveryConfirmKeyBaseIntegration {
  type: IntegrationType;
  getServiceName: () => ReturnType<BaseIntegration['getServiceName']>;
}
