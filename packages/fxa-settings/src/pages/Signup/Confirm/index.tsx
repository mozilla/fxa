/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { usePageViewEvent } from '../../../lib/metrics';
import { RouteComponentProps } from '@reach/router';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';
import { REACT_ENTRYPOINT } from '../../../constants';

export type ConfirmProps = {
  email: string;
  goBackCallback?: () => void;
  withWebmailLink?: boolean; // TO-DO: Replace broker functionality which gives us this value (provider?)
};

export type WebmailValues = {
  buttonText: string;
  link: string;
};

export const viewName = 'confirm';

const Confirm = ({
  email,
  goBackCallback,
  withWebmailLink,
}: RouteComponentProps & ConfirmProps) => {
  // TODO: Confirm event name  - could not hit this route
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const confirmSignupPageText: ConfirmWithLinkPageStrings = {
    headingFtlId: 'confirm-signup-heading',
    headingText: 'Confirm your account',
    instructionFtlId: 'confirm-signup-instruction',
    instructionText: `Check your email for the confirmation link sent to ${email}`,
  };

  const resendEmailCallback = () => {
    // TODO: resend email to user
  };

  return (
    <ConfirmWithLink
      confirmWithLinkPageStrings={confirmSignupPageText}
      {...{
        email,
        withWebmailLink,
        goBackCallback,
        resendEmailCallback,
      }}
    />
  );
};

export default Confirm;
