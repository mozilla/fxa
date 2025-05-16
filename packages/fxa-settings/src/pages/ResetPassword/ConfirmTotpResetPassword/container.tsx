/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useAuthClient, useFtlMsgResolver, useConfig } from '../../../models';
import ConfirmTotpResetPassword from '.';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

const ConfirmTotpResetPasswordContainer = (_: RouteComponentProps) => {
  const config = useConfig();
  const authClient = useAuthClient();
  const location = useLocation();
  const {
    code,
    email,
    token,
    emailToHashWith,
    recoveryKeyExists,
    estimatedSyncDeviceCount,
    uid,
  } = location.state as CompleteResetPasswordLocationState;

  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');

  const onSuccess = () => {
    navigateWithQuery('/complete_reset_password', {
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
  };

  const verifyCode = async (totpCode: string) => {
    setCodeErrorMessage('');
    try {
      const result = await authClient.checkTotpTokenCodeWithPasswordForgotToken(
        token,
        totpCode
      );
      if (result.success) {
        onSuccess();
      } else {
        setCodeErrorMessage(
          getLocalizedErrorMessage(
            ftlMsgResolver,
            AuthUiErrors.INVALID_OTP_CODE
          )
        );
      }
    } catch (error) {
      setCodeErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, error));
    }
  };

  const onTroubleWithCode = () => {
    const nextRoute = config.featureFlags?.recoveryPhonePasswordReset2fa
      ? '/reset_password_totp_recovery_choice'
      : '/confirm_backup_code_reset_password';
    navigateWithQuery(nextRoute, {
      state: {
        code,
        email,
        emailToHashWith,
        estimatedSyncDeviceCount,
        recoveryKeyExists,
        token,
        uid,
      },
      replace: false,
    });
  };

  return (
    <ConfirmTotpResetPassword
      {...{
        verifyCode,
        codeErrorMessage,
        setCodeErrorMessage,
        onTroubleWithCode,
      }}
    />
  );
};

export default ConfirmTotpResetPasswordContainer;
