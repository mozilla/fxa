/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { usePageViewEvent } from '../../../lib/metrics';
import { RouteComponentProps } from '@reach/router';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';
import { REACT_ENTRYPOINT } from '../../../constants';
import { ResendStatus } from '../../../lib/types';

export type ConfirmProps = {
  email: string;
};

export const viewName = 'confirm';

const Confirm = ({ email }: RouteComponentProps & ConfirmProps) => {
  // TODO: Confirm event name  - could not hit this route
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );

  const confirmSignupPageText: ConfirmWithLinkPageStrings = {
    headingFtlId: 'confirm-signup-heading',
    headingText: 'Confirm your account',
    instructionFtlId: 'confirm-signup-instruction',
    instructionText: `Check your email for the confirmation link sent to ${email}`,
  };

  const resendEmailHandler = async () => {
    try {
      // TO-DO: signin confirmation email to user.
      setResendStatus(ResendStatus['sent']);
    } catch (e) {
      setResendStatus(ResendStatus['error']);
    }
  };

  return (
    <ConfirmWithLink
      confirmWithLinkPageStrings={confirmSignupPageText}
      {...{
        email,
        resendEmailHandler,
        resendStatus,
      }}
    />
  );
};

export default Confirm;
