/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { POLLING_INTERVAL_MS, REACT_ENTRYPOINT } from '../../../constants';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
import { ResendStatus } from '../../../lib/types';
import { useAccount, useInterval, useRelier } from '../../../models';
import AppLayout from '../../../components/AppLayout';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';
import LinkRememberPassword from '../../../components/LinkRememberPassword';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';
import { setOriginalTabMarker } from '../../../lib/storage-utils';

export const viewName = 'confirm-reset-password';

export type ConfirmResetPasswordLocationState = {
  email: string;
  passwordForgotToken: string;
};

const ConfirmResetPassword = (_: RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const relier = useRelier();

  const navigate = useNavigate();
  let { state } = useLocation();

  if (!state) {
    state = {};
  }

  const { email, passwordForgotToken } =
    state as ConfirmResetPasswordLocationState;

  const account = useAccount();
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );
  const [isPolling, setIsPolling] = useState<number | null>(
    POLLING_INTERVAL_MS
  );
  const [currentPasswordForgotToken, setCurrentPasswordForgotToken] =
    useState<string>(passwordForgotToken);

  const navigateToPasswordReset = useCallback(() => {
    navigate('reset_password?showReactApp=true', { replace: true });
  }, [navigate]);

  if (!email || !passwordForgotToken) {
    navigateToPasswordReset();
  }

  useInterval(async () => {
    try {
      // A bit unconventional but this endpoint will throw an invalid token error
      // that represents the password has been reset (or that the token is expired)
      const isValid = await account.resetPasswordStatus(
        currentPasswordForgotToken
      );
      if (!isValid) {
        hardNavigateToContentServer('/signin');
      } else {
        // TODO: Not sure about this. It works with the flow... but.
        setOriginalTabMarker();
      }
    } catch (err) {
      setIsPolling(null);
    }
  }, isPolling);

  const resendEmailHandler = async () => {
    try {
      if (relier.isOAuth()) {
        const result = await account.resetPassword(
          email,
          relier.getService(),
          relier.getRedirectUri()
        );
        setCurrentPasswordForgotToken(result.passwordForgotToken);
      } else {
        const result = await account.resetPassword(email);
        setCurrentPasswordForgotToken(result.passwordForgotToken);
      }

      setResendStatus(ResendStatus['sent']);
      logViewEvent(viewName, 'resend', REACT_ENTRYPOINT);
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
