/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useAuthClient, useConfig, useFtlMsgResolver } from '../../../models';
import { PasskeyResetSignals, ResetPasswordIntegration } from '../interfaces';
import ConfirmResetPassword from '.';
import {
  ConfirmResetPasswordLocationState,
  RecoveryKeyCheckResult,
} from './interfaces';
import { ResendStatus } from '../../../lib/types';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import { shouldShowPasskeyResetOption } from '../../../lib/passkeys';

const ConfirmResetPasswordContainer = ({
  integration,
}: {
  integration: ResetPasswordIntegration;
}) => {
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendErrorMessage, setResendErrorMessage] = useState('');

  const authClient = useAuthClient();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();

  // The account isn't known until the OTP is verified, so the footer is shown
  // unconditionally when the feature is on — except for an active Sync sign-in,
  // where a passkey can't recover Sync data in Phase 1.
  const showPasskeyOption = shouldShowPasskeyResetOption(config, {
    serviceRequiresKeys: integration.isSync(),
  });

  const navigateWithQuery = useNavigateWithQuery();
  let location = useLocation();

  const { email, metricsContext } =
    (location.state as ConfirmResetPasswordLocationState) || {};

  useEffect(() => {
    if (!email || !metricsContext) {
      navigateWithQuery('/reset_password');
    }
  });

  const handleNavigation = ({
    code,
    emailToHashWith,
    token,
    uid,
    estimatedSyncDeviceCount,
    recoveryKeyExists,
    recoveryKeyHint,
    totpExists,
    hasPasskey,
  }: {
    code: string;
    emailToHashWith: string;
    token: string;
    uid: string;
    estimatedSyncDeviceCount?: number;
    recoveryKeyExists?: boolean;
    recoveryKeyHint?: string;
    totpExists?: boolean;
  } & PasskeyResetSignals) => {
    if (totpExists && recoveryKeyExists === false) {
      navigateWithQuery('/confirm_totp_reset_password', {
        state: {
          code,
          email,
          emailToHashWith,
          estimatedSyncDeviceCount,
          recoveryKeyExists,
          recoveryKeyHint,
          token,
          uid,
          hasPasskey,
        },
        replace: true,
      });
    } else if (recoveryKeyExists === true) {
      navigateWithQuery('/account_recovery_confirm_key', {
        state: {
          code,
          email,
          emailToHashWith,
          estimatedSyncDeviceCount,
          recoveryKeyExists,
          recoveryKeyHint,
          token,
          uid,
          totpExists,
          hasPasskey,
        },
        replace: true,
      });
    } else {
      navigateWithQuery('/complete_reset_password', {
        state: {
          code,
          email,
          emailToHashWith,
          estimatedSyncDeviceCount,
          recoveryKeyExists,
          token,
          uid,
          hasPasskey,
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
        exists: undefined,
        hint: undefined,
        estimatedSyncDeviceCount: undefined,
      } as RecoveryKeyCheckResult;
    }
  };

  const checkForTotp = async (token: string) => {
    return await authClient.checkTotpTokenExistsWithPasswordForgotToken(token);
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
      const { code, emailToHashWith, token, uid, hasPasskey } =
        await authClient.passwordForgotVerifyOtp(email, otpCode, options);
      const {
        exists: recoveryKeyExists,
        hint: recoveryKeyHint,
        estimatedSyncDeviceCount,
      } = await checkForRecoveryKey(token);
      const totpStatus = await checkForTotp(token);
      const totpExists = totpStatus.exists && totpStatus.verified;

      handleNavigation({
        code,
        emailToHashWith,
        token,
        uid,
        estimatedSyncDeviceCount,
        recoveryKeyExists,
        recoveryKeyHint,
        totpExists,
        hasPasskey,
      });
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
        integration,
        showPasskeyOption,
      }}
    />
  );
};

export default ConfirmResetPasswordContainer;
