/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useState } from 'react';
import ConfirmBackupCodeResetPassword from '.';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';

const ConfirmBackupCodeResetPasswordContainer = (_: RouteComponentProps) => {
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

  const verifyBackupCode = async (backupCode: string) => {
    setCodeErrorMessage('');
    try {
      await authClient.consumeRecoveryCodeWithPasswordForgotToken(
        token,
        backupCode
      );
      onSuccess();
    } catch (error) {
      setCodeErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, error));
    }
  };

  return (
    <ConfirmBackupCodeResetPassword
      {...{ verifyBackupCode, codeErrorMessage, setCodeErrorMessage }}
    />
  );
};

export default ConfirmBackupCodeResetPasswordContainer;
