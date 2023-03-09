/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { REACT_ENTRYPOINT } from '../../../constants';
import { logPageViewEvent } from '../../../lib/metrics';
import { ResendStatus } from '../../../lib/types';
import { useAccount, useInterval } from '../../../models';
import AppLayout from '../../../components/AppLayout';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';
import LinkRememberPassword from '../../../components/LinkRememberPassword';

export const viewName = 'confirm-reset-password';

export type ConfirmResetPasswordProps = {
  email: string;
  passwordForgotToken: string;
};

const POLLING_INTERVAL_MS = 2000;

const ConfirmResetPassword = (_: RouteComponentProps) => {
  logPageViewEvent(viewName, REACT_ENTRYPOINT);

  const navigate = useNavigate();
  let { state = {} } = useLocation();
  const account = useAccount();
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );
  const [isPolling, setIsPolling] = useState<number | null>(
    POLLING_INTERVAL_MS
  );

  const navigateToPasswordReset = useCallback(() => {
    navigate('reset_password?showReactApp=true', { replace: true });
  }, [navigate]);

  if (!state) {
    state = {};
  }

  let { email, passwordForgotToken } = state as ConfirmResetPasswordProps;

  if (!email || !passwordForgotToken) {
    navigateToPasswordReset();
  }

  useInterval(async () => {
    try {
      // A bit unconventional but this endpoint will throw an invalid token error
      // that represents the password has been reset.
      const isValid = await account.resetPasswordStatus(passwordForgotToken);
      if (!isValid) {
        // TODO: Going from react page to non-react page will require a hard
        // navigate. When signin flow have been converted we should be able
        // to use `navigate`
        window.location.href = '/signin';
      }
    } catch (err) {
      setIsPolling(null);
    }
  }, isPolling);

  const resendEmailHandler = async () => {
    try {
      const result = await account.resendResetPassword(email);
      passwordForgotToken = result.passwordForgotToken;
      setResendStatus(ResendStatus['sent']);
    } catch (e) {
      setResendStatus(ResendStatus['error']);
    }
  };

  const confirmResetPasswordStrings: ConfirmWithLinkPageStrings = {
    headingFtlId: 'confirm-pw-reset-header',
    headingText: 'Reset email sent',
    instructionFtlId: 'confirm-pw-reset-instructions',
    instructionText: `Click the link emailed to ${email} within the next hour to create a new password.`,
  };

  return (
    <AppLayout>
      <ConfirmWithLink
        {...{ email, resendEmailHandler, resendStatus }}
        confirmWithLinkPageStrings={confirmResetPasswordStrings}
      />
      <LinkRememberPassword {...{ email }} />
    </AppLayout>
  );
};

export default ConfirmResetPassword;
