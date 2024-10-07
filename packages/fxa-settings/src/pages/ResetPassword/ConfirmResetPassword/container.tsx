/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import ConfirmResetPassword from '.';
import {
  ConfirmResetPasswordLocationState,
  RecoveryKeyCheckResult,
} from './interfaces';
import { ResendStatus } from '../../../lib/types';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import PasswordResetConfirmTotp from '../../../components/PasswordResetConfirmTotp';
import AppLayout from '../../../components/AppLayout';

const ConfirmResetPasswordContainer = (_: RouteComponentProps) => {
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendErrorMessage, setResendErrorMessage] = useState('');
  const [shouldConfirmTotp, setShouldConfirmTotp] = useState(false);

  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();

  const navigate = useNavigateWithQuery();
  let location = useLocation();

  const { email, metricsContext } =
    (location.state as ConfirmResetPasswordLocationState) || {};

  useEffect(() => {
    if (!email || !metricsContext) {
      navigate(`/reset_password${location.search}`);
    }
  });

  const handleNavigation = (
    code: string,
    emailToHashWith: string,
    token: string,
    uid: string,
    estimatedSyncDeviceCount?: number,
    recoveryKeyExists?: boolean,
    recoveryKeyHint?: string
  ) => {
    if (recoveryKeyExists === true) {
      navigate('/account_recovery_confirm_key', {
        state: {
          code,
          email,
          emailToHashWith,
          estimatedSyncDeviceCount,
          recoveryKeyExists,
          recoveryKeyHint,
          token,
          uid,
        },
        replace: true,
      });
    } else {
      navigate('/complete_reset_password', {
        state: {
          code,
          email,
          emailToHashWith,
          estimatedSyncDeviceCount,
          recoveryKeyExists,
          token,
          uid,
        },
        replace: true,
      });
    }
  };

  const checkForRecoveryKey = async (passwordForgotToken: hexstring) => {
    try {
      const result: RecoveryKeyCheckResult =
        await authClient.passwordForgotRecoveryKeyStatus(passwordForgotToken);
      return result;
    } catch (error) {
      return {
        exist: undefined,
        hint: undefined,
        estimatedSyncDeviceCount: undefined,
      } as RecoveryKeyCheckResult;
    }
  };

  const checkForTotp = async (token: string) => {
    try {
      return await authClient.checkTotpTokenExistsWithPasswordForgotToken(
        token
      );
    } catch (error) {
      console.log('Error checking for TOTP', error);
      return {
        exists: false,
        verified: false,
      };
    }
  };

  const clearBanners = () => {
    setErrorMessage('');
    setResendErrorMessage('');
    setResendStatus(ResendStatus.none);
  };

  const verifyCode = async (otpCode: string) => {
    clearBanners();
    const options = { metricsContext };
    try {
      GleanMetrics.passwordReset.emailConfirmationSubmit();
      const { code, emailToHashWith, token, uid } =
        await authClient.passwordForgotVerifyOtp(email, otpCode, options);
      const {
        exists: recoveryKeyExists,
        hint: recoveryKeyHint,
        estimatedSyncDeviceCount,
      } = await checkForRecoveryKey(token);
      const { exists: totpExists } = await checkForTotp(token);

      if (totpExists) {
        setShouldConfirmTotp(true);
        return;
      }

      if (!!recoveryKeyExists) {
        handleNavigation(
          code,
          emailToHashWith,
          token,
          uid,
          estimatedSyncDeviceCount,
          recoveryKeyExists
        );
      }
    } catch (error) {
      // return custom error for expired or incorrect code
      const localizerErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      setErrorMessage(localizerErrorMessage);
    }
  };

  const resendCode = async () => {
    clearBanners();
    const options = { metricsContext };
    GleanMetrics.passwordReset.emailConfirmationResendCode();
    try {
      await authClient.passwordForgotSendOtp(email, options);
      setResendStatus(ResendStatus.sent);
    } catch (error) {
      setResendStatus(ResendStatus.error);
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      setResendErrorMessage(localizedErrorMessage);
    }
  };

  return (
    <div>
      {shouldConfirmTotp ? (
        <AppLayout>
          <PasswordResetConfirmTotp
            codeLength={6}
            onComplete={() => {
              console.log('Verfieid herehehrehrehrehrehrh');
              return Promise.resolve();
            }}
          ></PasswordResetConfirmTotp>
        </AppLayout>
      ) : (
        <ConfirmResetPassword
          {...{
            email,
            errorMessage,
            resendCode,
            resendStatus,
            resendErrorMessage,
            setErrorMessage,
            setResendStatus,
            verifyCode,
          }}
        />
      )}
    </div>
  );
};

export default ConfirmResetPasswordContainer;
