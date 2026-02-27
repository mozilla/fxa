/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ResetPasswordTokenTypes } from 'fxa-auth-client/browser';
import { Integration, OAuthIntegration } from '../../../models';

export interface CompleteResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export type CompleteResetPasswordLocationState = {
  code: string;
  email: string;
  token: string;
  kind: ResetPasswordTokenTypes;
  uid: string;
  accountResetToken?: string;
  emailToHashWith?: string;
  estimatedSyncDeviceCount?: number;
  kB?: string;
  recoveryKeyExists?: boolean;
  recoveryKeyId?: string;
};

export type CompleteResetPasswordOAuthIntegration = Pick<
  OAuthIntegration,
  'type' | 'data' | 'isSync'
>;

type CompleteResetPasswordIntegration =
  | Pick<Integration, 'type' | 'getServiceName' | 'getCmsInfo'>
  | CompleteResetPasswordOAuthIntegration;

export type CompleteResetPasswordContainerProps = {
  integration: CompleteResetPasswordIntegration;
};

export interface CompleteResetPasswordProps {
  email: string;
  errorMessage: string;
  locationState: CompleteResetPasswordLocationState;
  submitNewPassword: (newPassword: string) => Promise<void>;
  hasConfirmedRecoveryKey?: boolean;
  estimatedSyncDeviceCount?: number;
  recoveryKeyExists?: boolean;
  integration: Integration;
}

export type AccountResetData = {
  authAt: number;
  keyFetchToken: string;
  sessionToken: string;
  uid: string;
  unwrapBKey: string;
  emailVerified: boolean;
  sessionVerified: boolean;
};
