/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { Integration, OAuthWebIntegration } from '../../../models';
import { StoredAccountData } from '../../../lib/storage-utils';
import { QueryParams } from '../../..';

export type LocationState = {
  origin: 'signup' | undefined;
  selectedNewsletterSlugs?: string[];
  keyFetchToken?: string;
  unwrapBKey?: string;
  offeredSyncEngines?: string[];
  declinedSyncEngines?: string[];
  sessionToken?: hexstring;
  email?: hexstring;
  uid?: hexstring;
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
  offeredSyncEngines?: string[];
  declinedSyncEngines?: string[];
  flowQueryParams: QueryParams;
} & Pick<LocationState, 'keyFetchToken' | 'unwrapBKey'> &
  RouteComponentProps;

export interface ConfirmSignupCodeFormData {
  code: string;
}

export type ConfirmSignupCodeBaseIntegration = Pick<
  Integration,
  'type' | 'data' | 'getService'
>;

export type ConfirmSignupCodeOAuthIntegration = Pick<
  OAuthWebIntegration,
  | 'type'
  | 'data'
  | 'getService'
  | 'getRedirectUri'
  | 'wantsTwoStepAuthentication'
  | 'isSync'
  | 'getPermissions'
>;

export type ConfirmSignupCodeIntegration =
  | ConfirmSignupCodeBaseIntegration
  | ConfirmSignupCodeOAuthIntegration;

export interface GetEmailBounceStatusResponse {
  emailBounceStatus: { hasHardBounce: boolean };
}
