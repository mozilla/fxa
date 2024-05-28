/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import base32Decode from 'base32-decode';

import { decryptRecoveryKeyData } from 'fxa-auth-client/lib/recoveryKey';
import { getLocalizedErrorMessage } from '../../../lib/auth-errors/auth-errors';
import { useAccount } from '../../../models';
import { useFtlMsgResolver } from '../../../models/hooks';

import {
  AccountRecoveryConfirmKeyContainerProps,
  AccountRecoveryConfirmKeyLocationState,
} from './interfaces';

import AccountRecoveryConfirmKey from '.';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

const AccountRecoveryConfirmKeyContainer = ({
  serviceName,
}: AccountRecoveryConfirmKeyContainerProps & RouteComponentProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const navigate = useNavigateWithQuery();

  const {
    accountResetToken: previousAccountResetToken,
    code,
    email,
    emailToHashWith,
    estimatedSyncDeviceCount,
    recoveryKeyExists,
    token,
    uid,
  } = (location.state as AccountRecoveryConfirmKeyLocationState) || {};

  // The password forgot code can only be used once to retrieve `accountResetToken`
  // so we set its value after the first request for subsequent requests.
  const [accountResetToken, setAccountResetToken] = useState(
    previousAccountResetToken || ''
  );

  const getRecoveryBundleAndNavigate = async (
    fetchedAccountResetToken: string,
    recoveryKey: string
  ) => {
    // TODO in FXA-9672: do not use Account model in reset password pages
    const { recoveryData, recoveryKeyId } = await account.getRecoveryKeyBundle(
      fetchedAccountResetToken,
      recoveryKey,
      uid
    );

    const decodedRecoveryKey = base32Decode(recoveryKey, 'Crockford');
    const uint8RecoveryKey = new Uint8Array(decodedRecoveryKey);

    const { kB } = await decryptRecoveryKeyData(
      uint8RecoveryKey,
      recoveryData,
      uid
    );

    navigate('/account_recovery_reset_password', {
      state: {
        accountResetToken: fetchedAccountResetToken,
        email,
        emailToHashWith,
        estimatedSyncDeviceCount,
        kB,
        recoveryKeyId,
      },
      replace: true,
    });
  };

  const verifyRecoveryKey = async (recoveryKey: string) => {
    try {
      let fetchedAccountResetToken = accountResetToken;
      if (!fetchedAccountResetToken) {
        // TODO in FXA-9672: do not use Account model in reset password pages
        fetchedAccountResetToken = await account.passwordForgotVerifyCode(
          token,
          code,
          true
        );
        setAccountResetToken(fetchedAccountResetToken);
      }
      await getRecoveryBundleAndNavigate(fetchedAccountResetToken, recoveryKey);
    } catch (error) {
      const localizedBannerMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      setIsSubmitting(false);
      setErrorMessage(localizedBannerMessage);
    }
  };

  return (
    <AccountRecoveryConfirmKey
      {...{
        accountResetToken,
        code,
        email,
        emailToHashWith,
        errorMessage,
        estimatedSyncDeviceCount,
        isSubmitting,
        recoveryKeyExists,
        serviceName,
        setErrorMessage,
        setIsSubmitting,
        token,
        verifyRecoveryKey,
        uid,
      }}
    />
  );
};

export default AccountRecoveryConfirmKeyContainer;
