/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/lib/client';
import { Constants } from '../../lib/constants';
import { IntegrationFlags } from '../../lib/integrations/interfaces/integration-flags';
import { OAuthRelier } from '../reliers';

import {
  BaseIntegration,
  IntegrationFeatures,
  IntegrationType,
} from './base-integration';
import {
  OAuthRedirectIntegration,
  ResetPasswordCallbacks,
} from './oauth-redirect-integration';

interface OAuthIntegrationFeatures extends IntegrationFeatures {
  webChannelSupport: boolean;
}

type OAuthIntegrationTypes =
  | IntegrationType.OAuth
  | IntegrationType.PairingSupplicant;

export type SearchParam = IntegrationFlags['searchParam'];

export function isOAuthIntegration(
  integration: BaseIntegration<any> | OAuthIntegration
): integration is OAuthIntegration {
  return (integration as OAuthIntegration).handlePasswordReset !== undefined;
}

export class OAuthIntegration extends BaseIntegration<OAuthIntegrationFeatures> {
  constructor(
    public relier: OAuthRelier,
    type: OAuthIntegrationTypes = IntegrationType.OAuth
  ) {
    super(type);
    this.setFeatures({
      handleSignedInNotification: false,
      reuseExistingSession: true,
      webChannelSupport: relier.context === Constants.OAUTH_WEBCHANNEL_CONTEXT,
    });
  }

  /**
   * Handles a password reset event
   * @param relier - An OAuth Relier
   * @param authClient - A FxA Auth Client
   * @param accountUid - The current account's uid.
   * @param sessionToken - The session token provided by the password reset
   * @param keyFetchToken - The keyFetchToken provided by the password reset
   * @param unwrapBKey - Used to unwrap the account keys
   * @returns
   */
  public async handlePasswordReset(
    accountUid: string,
    sessionToken: string,
    keyFetchToken: string,
    unwrapKB: string,
    callbacks: ResetPasswordCallbacks
  ) {
    const integration = new OAuthRedirectIntegration(this.relier, callbacks);

    return await integration.handlePasswordReset(
      accountUid,
      sessionToken,
      keyFetchToken,
      unwrapKB
    );
  }
}
