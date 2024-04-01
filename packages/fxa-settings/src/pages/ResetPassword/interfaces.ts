/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { QueryParams } from '../..';
import { MozServices } from '../../lib/types';
import {
  BaseIntegration,
  IntegrationType,
  OAuthIntegration,
} from '../../models';

export interface ResetPasswordOAuthIntegration {
  type: IntegrationType.OAuth;
  getRedirectUri: () => ReturnType<OAuthIntegration['getRedirectUri']>;
  saveOAuthState: () => ReturnType<OAuthIntegration['saveOAuthState']>;
  getServiceName: () => ReturnType<OAuthIntegration['getServiceName']>;
  getService: () => ReturnType<OAuthIntegration['getService']>;
}

export interface ResetPasswordBaseIntegration {
  type: IntegrationType;
  getServiceName: () => ReturnType<BaseIntegration['getServiceName']>;
}

type ResetPasswordIntegration =
  | ResetPasswordOAuthIntegration
  | ResetPasswordBaseIntegration;

export interface ResetPasswordProps {
  prefillEmail?: string;
  forceAuth?: boolean;
  serviceName?: MozServices;
  integration: ResetPasswordIntegration;
  flowQueryParams?: QueryParams;
}

export interface ResetPasswordFormData {
  email: string;
}
