/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useState } from 'react';
import ConfirmTotpResetPassword from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';

const ConfirmTotpResetPasswordContainer = (_: RouteComponentProps) => {
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

  const onTroubleWithCode = async () => {
    const nextRoute = '/reset_password_totp_recovery_choice';

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
