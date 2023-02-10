/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import Banner, { BannerType } from '../../../components/Banner';

import LinkRememberPassword from '../../../components/LinkRememberPassword';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';
import { REACT_ENTRYPOINT } from '../../../constants';
import AppLayout from '../../../components/AppLayout';
import { useAccount, useInterval } from '../../../models';
import { FtlMsg } from 'fxa-react/dist/lib/utils';
import { logPageViewEvent } from '../../../lib/metrics';

export const viewName = 'confirm-reset-password';

export type ConfirmResetPasswordProps = {
  email: string;
  passwordForgotToken: string;
};

const POLLING_INTERVAL_MS = 2000;
const FIREFOX_NOREPLY_EMAIL = 'accounts@firefox.com';

const ConfirmResetPassword = (_: RouteComponentProps) => {
  logPageViewEvent(viewName, REACT_ENTRYPOINT);

  const navigate = useNavigate();
  let { state = {} } = useLocation();
  const account = useAccount();
  const [passwordResetResend, setPasswordResetResend] = useState(false);
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
      const status = await account.resetPasswordStatus(passwordForgotToken);
      if (status) {
        // TODO: Going from react page to non-react page will require a hard
        // navigate. When signin flow have been converted we should be able
        // to use `navigate`
        window.location.href = '/signin';
      }
    } catch (err) {
      setIsPolling(null);
    }
  }, isPolling);

  const resendHandler = async () => {
    const result = await account.resetPassword(email);
    passwordForgotToken = result.passwordForgotToken;
    setPasswordResetResend(true);
  };

  const confirmResetPasswordStrings: ConfirmWithLinkPageStrings = {
    headingFtlId: 'confirm-pw-reset-header',
    headingText: 'Reset email sent',
    instructionFtlId: 'confirm-pw-reset-instructions',
    instructionText: `Click the link emailed to ${email} within the next hour to create a new password.`,
  };

  return (
    <AppLayout>
      {passwordResetResend && (
        <Banner
          type={BannerType.success}
          dismissible
          setIsVisible={setPasswordResetResend}
        >
          <FtlMsg
            id="resend-pw-reset-banner"
            vars={{ accountsEmail: FIREFOX_NOREPLY_EMAIL }}
          >
            <p>
              Email resent. Add accounts@firefox.com to your contacts to ensure
              a smooth delivery.
            </p>
          </FtlMsg>
        </Banner>
      )}
      <ConfirmWithLink
        {...{ email }}
        confirmWithLinkPageStrings={confirmResetPasswordStrings}
        resendEmailCallback={resendHandler}
      />
      <LinkRememberPassword {...{ email }} />
    </AppLayout>
  );
};

export default ConfirmResetPassword;
