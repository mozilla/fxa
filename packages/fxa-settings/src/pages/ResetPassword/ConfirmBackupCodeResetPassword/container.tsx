/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { useAuthClient, useConfig, useFtlMsgResolver } from '../../../models';
import { PasskeyResetSignals, ResetPasswordIntegration } from '../interfaces';
import ConfirmBackupCodeResetPassword from '.';
import { useNavigateWithQuery } from '../../../lib/hooks';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { shouldShowPasskeyResetOption } from '../../../lib/passkeys';

const ConfirmBackupCodeResetPasswordContainer = ({
  integration,
}: {
  integration: ResetPasswordIntegration;
}) => {
  const authClient = useAuthClient();
  const config = useConfig();
  const location = useLocation();

  const {
    code,
    email,
    token,
    emailToHashWith,
    recoveryKeyExists,
    estimatedSyncDeviceCount,
    uid,
    hasPasskey,
    hasPasskeyWraps,
  } = location.state as CompleteResetPasswordLocationState;

  // Built once and spread, so a new signal is one edit rather than one per
  // navigate target — an omission arrives undefined and fails closed silently.
  const passkeySignals: PasskeyResetSignals = { hasPasskey, hasPasskeyWraps };

  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  const showPasskeyOption = shouldShowPasskeyResetOption(config, {
    ...passkeySignals,
    serviceRequiresKeys: integration.isSync(),
    requireHasPasskey: true,
  });

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
        ...passkeySignals,
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
      {...{
        verifyBackupCode,
        codeErrorMessage,
        setCodeErrorMessage,
        integration,
        email,
        showPasskeyOption,
      }}
    />
  );
};

export default ConfirmBackupCodeResetPasswordContainer;
