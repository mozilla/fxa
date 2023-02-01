/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { usePageViewEvent } from '../../../lib/metrics';
import { RouteComponentProps } from '@reach/router';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';

export type ConfirmSigninProps = {
  email: string;
  goBackCallback?: () => void;
  withWebmailLink?: boolean; // TO-DO: Replace broker functionality which gives us this value (provider?)
};

const ConfirmSignin = ({
  email,
  goBackCallback,
  withWebmailLink,
}: RouteComponentProps & ConfirmSigninProps) => {
  usePageViewEvent('confirm-signin', {
    entrypoint_variation: 'react',
  });

  const confirmSigninPageText: ConfirmWithLinkPageStrings = {
    headingFtlId: 'confirm-signin-heading',
    headingText: 'Confirm this sign-in',
    instructionFtlId: 'confirm-signin-instruction',
    instructionText: `Check your email for the sign-in confirmation link sent to ${email}`,
  };

  const resendEmailCallback = () => {
    // TO-DO: resend email to user.
  };

  /*
    TO-DO:
        - Fix up the alert bar for any errors (such as from resending the email) or success.
        - wire up the functionality to resend an email
  */

  return (
    <>
      <ConfirmWithLink
        {...{
          email,
          goBackCallback,
          withWebmailLink,
          resendEmailCallback,
        }}
        confirmWithLinkPageStrings={confirmSigninPageText}
      />
    </>
  );
};

export default ConfirmSignin;
