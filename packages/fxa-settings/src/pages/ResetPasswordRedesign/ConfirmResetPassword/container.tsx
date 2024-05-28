/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { getLocalizedErrorMessage } from '../../../lib/auth-errors/auth-errors';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import ConfirmResetPassword from '.';
import {
  ConfirmResetPasswordLocationState,
  RecoveryKeyCheckResult,
} from './interfaces';
import { ResendStatus } from '../../../lib/types';

const ConfirmResetPasswordContainer = (_: RouteComponentProps) => {
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );
  const [errorMessage, setErrorMessage] = useState('');
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();

  const navigate = useNavigate();
  let location = useLocation();

  const { email, metricsContext } =
    (location.state as ConfirmResetPasswordLocationState) || {};

  const searchParams = location.search;

  const handleNavigation = (
    code: string,
    emailToHashWith: string,
    token: string,
    uid: string,
    estimatedSyncDeviceCount?: number,
    recoveryKeyExists?: boolean
  ) => {
    if (recoveryKeyExists === true) {
      navigate(`/account_recovery_confirm_key${searchParams}`, {
        state: {
          code,
          email,
          emailToHashWith,
          estimatedSyncDeviceCount,
          recoveryKeyExists,
          token,
          uid,
        },
      });
    } else {
      navigate(`/complete_reset_password${searchParams}`, {
        state: {
          code,
          email,
          emailToHashWith,
          estimatedSyncDeviceCount,
          recoveryKeyExists,
          token,
          uid,
        },
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
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      setErrorMessage(localizedErrorMessage);
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

  if (!email) {
    navigate(`/reset_password${searchParams}`);
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ConfirmResetPassword
      {...{
        email,
        errorMessage,
        resendCode,
        resendStatus,
        searchParams,
        setErrorMessage,
        setResendStatus,
        verifyCode,
      }}
    />
  );
};

export default ConfirmResetPasswordContainer;
