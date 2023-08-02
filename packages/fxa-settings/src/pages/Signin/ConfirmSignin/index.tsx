/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { RouteComponentProps } from '@reach/router';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';
import { REACT_ENTRYPOINT } from '../../../constants';
import { ResendStatus } from '../../../lib/types';
import { useFtlMsgResolver } from '../../../models';
import { getLocalizedErrorMessage } from '../../../lib/auth-errors/auth-errors';

export type ConfirmSigninProps = {
  email: string;
  goBackCallback?: () => void;
};

export const viewName = 'confirm-signin';

const ConfirmSignin = ({
  email,
  goBackCallback,
}: RouteComponentProps & ConfirmSigninProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const ftlMsgResolver = useFtlMsgResolver();

  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );
  const [errorMessage, setErrorMessage] = useState<string>();

  const confirmSigninPageText: ConfirmWithLinkPageStrings = {
    headingFtlId: 'confirm-signin-heading',
    headingText: 'Confirm this sign-in',
    instructionFtlId: 'confirm-signin-instruction',
    instructionText: `Check your email for the sign-in confirmation link sent to ${email}`,
  };

  const resendEmailHandler = async () => {
    try {
      // TO-DO: signin confirmation email to user.
      logViewEvent(viewName, 'resend', REACT_ENTRYPOINT);
      setErrorMessage('');
      setResendStatus(ResendStatus['sent']);
    } catch (err) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        err
      );
      setResendStatus(ResendStatus['error']);
      setErrorMessage(localizedErrorMessage);
    }
  };

  return (
    <>
      <ConfirmWithLink
        {...{
          email,
          resendEmailHandler,
          resendStatus,
          errorMessage,
        }}
        confirmWithLinkPageStrings={confirmSigninPageText}
      />
    </>
  );
};

export default ConfirmSignin;
