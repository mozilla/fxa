/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useAccount, useFtlMsgResolver } from '../../models';
import { ResendStatus } from '../../lib/types';
import { logViewEvent } from 'fxa-settings/src/lib/metrics';
import { REACT_ENTRYPOINT } from 'fxa-settings/src/constants';
import { LinkExpired } from '../LinkExpired';
import { getLocalizedErrorMessage } from '../../lib/error-utils';

type LinkExpiredResetPasswordProps = {
  viewName: string;
  email: string;
  service?: string;
  redirectUri?: string;
};

export const LinkExpiredResetPassword = ({
  viewName,
  email,
  service,
  redirectUri,
}: LinkExpiredResetPasswordProps) => {
  // TODO in FXA-7630 add metrics event and associated tests for users hitting the LinkExpired page
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();

  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );
  const [errorMessage, setErrorMessage] = useState<string>();

  const resendResetPasswordLink = async () => {
    try {
      if (service && redirectUri) {
        await account.resetPassword(email, service, redirectUri);
      } else {
        await account.resetPassword(email);
      }
      logViewEvent(viewName, 'resend', REACT_ENTRYPOINT);
      setErrorMessage('');
      setResendStatus(ResendStatus.sent);
    } catch (err) {
      setResendStatus(ResendStatus.error);
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        err
      );
      setErrorMessage(localizedErrorMessage);
    }
  };

  return (
    <LinkExpired
      headingText="Reset password link expired"
      headingTextFtlId="reset-pwd-link-expired-header"
      messageText="The link you clicked to reset your password is expired."
      messageFtlId="reset-pwd-link-expired-message"
      resendLinkHandler={resendResetPasswordLink}
      {...{ resendStatus, errorMessage }}
    />
  );
};
