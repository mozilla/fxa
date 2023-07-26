/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useAccount, useRelier } from '../../models';
import { ResendStatus } from '../../lib/types';
import { logViewEvent } from 'fxa-settings/src/lib/metrics';
import { REACT_ENTRYPOINT } from 'fxa-settings/src/constants';
import { LinkExpired } from '../LinkExpired';

type LinkExpiredResetPasswordProps = {
  email: string;
  viewName: string;
};

export const LinkExpiredResetPassword = ({
  email,
  viewName,
}: LinkExpiredResetPasswordProps) => {
  // TODO in FXA-7630 add metrics event and associated tests for users hitting the LinkExpired page
  const account = useAccount();
  const relier = useRelier();

  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );

  const resendResetPasswordLink = async () => {
    try {
      if (relier.isOAuth()) {
        await account.resetPassword(
          email,
          relier.getService(),
          relier.getRedirectUri()
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
