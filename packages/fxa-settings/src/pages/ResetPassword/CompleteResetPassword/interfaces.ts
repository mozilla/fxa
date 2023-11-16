/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IntegrationSubsetType } from '../../../lib/integrations';
import { LinkStatus } from '../../../lib/types';
import { IntegrationType, OAuthIntegrationData } from '../../../models';
import { CompleteResetPasswordLink } from '../../../models/reset-password/verification';

export enum CompleteResetPasswordErrorType {
  'none',
  'recovery-key',
  'complete-reset',
}

export interface CompleteResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export type CompleteResetPasswordSubmitData = {
  newPassword: string;
} & CompleteResetPasswordParams;

export interface CompleteResetPasswordLocationState {
  lostRecoveryKey: boolean;
  accountResetToken: string;
}

export interface CompleteResetPasswordParams {
  email: string;
  emailToHashWith: string | undefined;
  code: string;
  token: string;
}

export interface CompleteResetPasswordOAuthIntegration {
  type: IntegrationType.OAuth;
  data: { uid: OAuthIntegrationData['uid'] };
}

export type CompleteResetPasswordIntegration =
  | CompleteResetPasswordOAuthIntegration
  | IntegrationSubsetType;

export interface CompleteResetPasswordProps {
  linkModel: CompleteResetPasswordLink;
  setLinkStatus: React.Dispatch<React.SetStateAction<LinkStatus>>;
  integration: CompleteResetPasswordIntegration;
}
