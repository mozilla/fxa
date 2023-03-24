/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
// import { useLocation } from '@reach/router';
// import { useAccount } from '../../models';
import { ResendStatus } from '../../lib/types';
import { LinkExpired } from '../LinkExpired';

// type LocationState = { email: string };

type SubComponentProps = {
  viewName: string;
};

export const LinkExpiredSignin = ({ viewName }: SubComponentProps) => {
  // const account = useAccount();
  // const location = useLocation() as ReturnType<typeof useLocation> & {
  //   state: LocationState;
  // };
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );

  const resendSigninLink = async () => {
    try {
      // TODO hook up functionality to resend a new signin confirmation link
      // method below does not exist and needs to be mapped to equivalent function in content-server
      // await account.resendSigninConfirmationLink(location.state.email);
      setResendStatus(ResendStatus['sent']);
      return Promise.resolve();
    } catch (e) {
      setResendStatus(ResendStatus['error']);
    }
  };

  return (
    <LinkExpired
      headingText="Confirmation link expired"
      headingTextFtlId="signin-link-expired-header"
      messageText="The link you clicked to confirm your email is expired."
      messageFtlId="signin-link-expired-message"
      resendLinkHandler={resendSigninLink}
      {...{ resendStatus }}
    />
  );
};
