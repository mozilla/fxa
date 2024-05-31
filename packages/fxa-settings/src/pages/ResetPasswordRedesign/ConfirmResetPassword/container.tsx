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

const ConfirmResetPasswordContainer = (_: RouteComponentProps) => {
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );
  const [errorMessage, setErrorMessage] = useState('');
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
    recoveryKeyExists?: boolean
  ) => {
    if (recoveryKeyExists === true) {
      navigate('/account_recovery_confirm_key', {
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

  const checkForRecoveryKey = async () => {
    try {
      const result: RecoveryKeyCheckResult = await authClient.recoveryKeyExists(
        undefined,
        email
      );
      return result;
    } catch (error) {
      return {
        exist: undefined,
        estimatedSyncDeviceCount: undefined,
      } as RecoveryKeyCheckResult;
    }
  };

  const verifyCode = async (otpCode: string) => {
    setErrorMessage('');
    setResendStatus(ResendStatus['not sent']);
    const options = { metricsContext };
    try {
      GleanMetrics.passwordReset.emailConfirmationSubmit();
      const { code, emailToHashWith, token, uid } =
        await authClient.passwordForgotVerifyOtp(email, otpCode, options);
      const { exists: recoveryKeyExists, estimatedSyncDeviceCount } =
        await checkForRecoveryKey();
      handleNavigation(
        code,
        emailToHashWith,
        token,
        uid,
        estimatedSyncDeviceCount,
        recoveryKeyExists
      );
    } catch (error) {
      const localizerErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      setErrorMessage(localizerErrorMessage);
    }
  };

  const resendCode = async () => {
    setErrorMessage('');
    const options = { metricsContext };
    try {
      await authClient.passwordForgotSendOtp(email, options);
      return true;
    } catch (err) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        err
      );
      setErrorMessage(localizedErrorMessage);
      return false;
    }
  };

  return (
    <ConfirmResetPassword
      {...{
        email,
        errorMessage,
        resendCode,
        resendStatus,
        setErrorMessage,
        setResendStatus,
        verifyCode,
      }}
    />
  );
};

export default ConfirmResetPasswordContainer;
