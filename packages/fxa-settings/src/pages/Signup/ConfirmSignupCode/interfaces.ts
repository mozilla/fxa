/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import {
  BaseIntegrationData,
  Integration,
  IntegrationType,
  OAuthIntegration,
  OAuthIntegrationData,
} from '../../../models';
import { StoredAccountData } from '../../../lib/storage-utils';

export type LocationState = {
  selectedNewsletterSlugs?: string[];
  keyFetchToken?: string;
  unwrapBKey?: string;
};

export type ConfirmSignupCodeContainerProps = {
  integration: Integration;
  storedAccountData: StoredAccountData;
} & RouteComponentProps;

export type ConfirmSignupCodeProps = {
  email: string;
  sessionToken: hexstring;
  uid: hexstring;
  integration: ConfirmSignupCodeIntegration;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  newsletterSlugs?: string[];
} & Pick<LocationState, 'keyFetchToken' | 'unwrapBKey'> &
  RouteComponentProps;

export interface ConfirmSignupCodeFormData {
  code: string;
}

export interface ConfirmSignupCodeBaseIntegration {
  type: IntegrationType;
  data: {
    uid: BaseIntegrationData['uid'];
  };
}

export interface ConfirmSignupCodeOAuthIntegration {
  type: IntegrationType.OAuth;
  data: {
    uid: OAuthIntegrationData['uid'];
  };
  getService: () => ReturnType<OAuthIntegration['getService']>;
  getRedirectUri: () => ReturnType<OAuthIntegration['getService']>;
}

export type ConfirmSignupCodeIntegration =
  | ConfirmSignupCodeOAuthIntegration
  | ConfirmSignupCodeBaseIntegration;
