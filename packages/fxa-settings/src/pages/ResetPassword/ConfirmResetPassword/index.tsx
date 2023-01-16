/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as MailLink } from './graphic_mail.svg';
import { usePageViewEvent } from '../../../lib/metrics';

import LinkRememberPassword from '../../../components/LinkRememberPassword';

export type ConfirmResetPasswordProps = {
  email?: string;
  forceEmail?: string;
  canSignIn?: boolean;
};

const ConfirmResetPassword = ({
  email,
  forceEmail,
  canSignIn,
}: ConfirmResetPasswordProps & RouteComponentProps) => {
  usePageViewEvent('confirm-reset-password', {
    entrypoint_variation: 'react',
  });

  // TODO check for passwordResetToken (confirms reset password initiated)
  // TODO redirect to reset_password if !passwordResetToken and/or !email

  const resendHandler = () => {
    // TODO resend code
    // TODO logViewEvent metric
  };

  return (
    <>
      <div className="mb-4">
        <FtlMsg id="confirm-pw-reset-header">
          <h1 className="card-header">Reset email sent</h1>
        </FtlMsg>
      </div>
      <div className="flex justify-center mx-auto">
        <MailLink />
      </div>
      <FtlMsg id="confirm-pw-reset-instructions">
        <p className="my-4 text-sm">{`Click the link emailed to ${email} within the next hour to create a new password.`}</p>
      </FtlMsg>
      <FtlMsg id="confirm-pw-reset-resend">
        <button
          className="link-blue text-sm"
          onClick={(e) => {
            resendHandler();
          }}
        >
          Not in inbox or spam folder? Resend
        </button>
      </FtlMsg>

      {canSignIn && !forceEmail && <LinkRememberPassword {...{ email }} />}
      {canSignIn && forceEmail && <LinkRememberPassword {...{ forceEmail }} />}
    </>
  );
};

export default ConfirmResetPassword;
