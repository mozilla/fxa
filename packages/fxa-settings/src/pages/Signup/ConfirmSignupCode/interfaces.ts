/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import {
  BaseIntegrationData,
  IntegrationType,
  OAuthIntegration,
  OAuthIntegrationData,
} from '../../../models';

export type ConfirmSignupCodeProps = {
  integration: ConfirmSignupCodeIntegration;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
} & RouteComponentProps;

export interface ConfirmSignupCodeFormData {
  code: string;
}

export interface ConfirmSignupCodeOAuthIntegration {
  type: IntegrationType.OAuth;
  data: {
    uid: OAuthIntegrationData['uid'];
  };
  getService: () => ReturnType<OAuthIntegration['getService']>;
  getRedirectUri: () => ReturnType<OAuthIntegration['getService']>;
}

export interface ConfirmSignupCodeBaseIntegration {
  type: IntegrationType;
  data: {
    uid: BaseIntegrationData['uid'];
  };
}

export type ConfirmSignupCodeIntegration =
  | ConfirmSignupCodeOAuthIntegration
  | ConfirmSignupCodeBaseIntegration;
