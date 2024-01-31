/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import {
  BaseIntegrationData,
  IntegrationType,
  OAuthIntegration,
  OAuthIntegrationData,
} from '../../../models';

export type AccountRecoveryResetPasswordProps = {
  integration: AccountRecoveryResetPasswordIntegration;
} & RouteComponentProps;

export interface AccountRecoveryResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export enum AccountRecoveryResetPasswordBannerState {
  None,
  UnexpectedError,
  PasswordResetSuccess,
  Redirecting,
  PasswordResendError,
  ValidationError,
}

export interface AccountRecoveryResetPasswordLocationState {
  accountResetToken: string;
  kB: string;
  recoveryKeyId: string;
}

export interface AccountRecoveryResetPasswordOAuthIntegration {
  type: IntegrationType.OAuth;
  data: {
    uid: OAuthIntegrationData['uid'];
    resetPasswordConfirm: OAuthIntegrationData['resetPasswordConfirm'];
  };
  getService: () => ReturnType<OAuthIntegration['getService']>;
  getRedirectUri: () => ReturnType<OAuthIntegration['getService']>;
  isSync: () => ReturnType<OAuthIntegration['isSync']>;
}

export interface AccountRecoveryResetPasswordBaseIntegration {
  type: IntegrationType;
  data: {
    uid: BaseIntegrationData['uid'];
    resetPasswordConfirm: BaseIntegrationData['resetPasswordConfirm'];
  };
}

export type AccountRecoveryResetPasswordIntegration =
  | AccountRecoveryResetPasswordOAuthIntegration
  | AccountRecoveryResetPasswordBaseIntegration;
