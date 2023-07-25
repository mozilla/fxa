/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import {
  IntegrationType,
  OAuthIntegration,
  isOAuthIntegration,
  useAccount,
} from '../../models';
import { ResendStatus } from '../../lib/types';
import { logViewEvent } from 'fxa-settings/src/lib/metrics';
import { REACT_ENTRYPOINT } from 'fxa-settings/src/constants';
import { LinkExpired } from '../LinkExpired';
import { IntegrationSubsetType } from '../../lib/integrations';

type LinkExpiredResetPasswordProps = {
  email: string;
  viewName: string;
  integration: LinkExpiredResetPasswordIntegration;
};

interface LinkExpiredResetPasswordOAuthIntegration {
  type: IntegrationType.OAuth;
  getService: () => ReturnType<OAuthIntegration['getService']>;
  getRedirectUri: () => ReturnType<OAuthIntegration['getService']>;
}

type LinkExpiredResetPasswordIntegration =
  | LinkExpiredResetPasswordOAuthIntegration
  | IntegrationSubsetType;

export const LinkExpiredResetPassword = ({
  email,
  viewName,
  integration,
}: LinkExpiredResetPasswordProps) => {
  // TODO in FXA-7630 add metrics event and associated tests for users hitting the LinkExpired page
  const account = useAccount();

  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );

  const resendResetPasswordLink = async () => {
    try {
      if (isOAuthIntegration(integration)) {
        await account.resetPassword(
          email,
          integration.getService(),
          integration.getRedirectUri()
        );
      } else {
        await account.resetPassword(email);
      }
      logViewEvent(viewName, 'resend', REACT_ENTRYPOINT);
      setResendStatus(ResendStatus['sent']);
    } catch (e) {
      setResendStatus(ResendStatus['error']);
    }
  };

  return (
    <LinkExpired
      headingText="Reset password link expired"
      headingTextFtlId="reset-pwd-link-expired-header"
      messageText="The link you clicked to reset your password is expired."
      messageFtlId="reset-pwd-link-expired-message"
      resendLinkHandler={resendResetPasswordLink}
      {...{ resendStatus }}
    />
  );
};
