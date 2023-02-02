/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { usePageViewEvent } from '../../../lib/metrics';

import LinkRememberPassword from '../../../components/LinkRememberPassword';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';
import { REACT_ENTRYPOINT } from '../../../constants';

export const viewName = 'confirm-reset-password';

export type ConfirmResetPasswordProps = {
  email: string;
  forceAuth?: boolean;
  canSignIn?: boolean;
};

const ConfirmResetPassword = ({
  email,
  forceAuth,
  canSignIn,
}: ConfirmResetPasswordProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  // TODO check for passwordResetToken (confirms reset password initiated)
  // TODO redirect to reset_password if !passwordResetToken

  const resendHandler = () => {
    // TODO resend code
    // TODO logViewEvent metric
  };

  const confirmResetPasswordStrings: ConfirmWithLinkPageStrings = {
    headingFtlId: 'confirm-pw-reset-header',
    headingText: 'Reset email sent',
    instructionFtlId: 'confirm-pw-reset-instructions',
    instructionText: `Click the link emailed to ${email} within the next hour to create a new password.`,
  };

  return (
    <>
      <ConfirmWithLink
        {...{ email }}
        confirmWithLinkPageStrings={confirmResetPasswordStrings}
        resendEmailCallback={resendHandler}
      />
      {canSignIn && <LinkRememberPassword {...{ email, forceAuth }} />}
    </>
  );
};

export default ConfirmResetPassword;
