/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IntegrationSubsetType } from '../../../lib/integrations';
import { IntegrationType, OAuthIntegration } from '../../../models';

export interface ConfirmResetPasswordOAuthIntegration {
  type: IntegrationType.OAuth;
  getRedirectUri: () => ReturnType<OAuthIntegration['getRedirectUri']>;
  getService: () => ReturnType<OAuthIntegration['getService']>;
}

export type ConfirmResetPasswordIntegration =
  | ConfirmResetPasswordOAuthIntegration
  | IntegrationSubsetType;

export interface ConfirmResetPasswordLocationState {
  email: string;
  passwordForgotToken: string;
}
