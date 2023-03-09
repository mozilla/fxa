/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useLocation } from '@reach/router';
import { useAccount } from '../../models';
import { ResendStatus } from '../../lib/types';
import { logViewEvent } from 'fxa-settings/src/lib/metrics';
import { REACT_ENTRYPOINT } from 'fxa-settings/src/constants';
import { LinkExpired } from '../LinkExpired';

type LocationState = { email: string };

type SubComponentProps = {
  viewName: string;
};

export const LinkExpiredResetPassword = ({ viewName }: SubComponentProps) => {
  const account = useAccount();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );

  const resendResetPasswordLink = async () => {
    try {
      await account.resendResetPassword(location.state.email);
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
