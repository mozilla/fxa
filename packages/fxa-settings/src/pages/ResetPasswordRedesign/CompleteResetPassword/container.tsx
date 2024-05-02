/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';

import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import {
  Integration,
  useAccount,
  useConfig,
  useFtlMsgResolver,
} from '../../../models';
import { KeyStretchExperiment } from '../../../models/experiments';

import CompleteResetPassword from '.';
import {
  AccountResetData,
  CompleteResetPasswordLocationState,
} from './interfaces';
import GleanMetrics from '../../../lib/glean';
import firefox from '../../../lib/channels/firefox';
import { getLocalizedErrorMessage } from '../../../lib/auth-errors/auth-errors';
import { useState } from 'react';

// This component is used for both /complete_reset_password and /account_recovery_reset_password routes
// for easier maintenance

const CompleteResetPasswordContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const keyStretchExperiment = useValidatedQueryParams(KeyStretchExperiment);

  const account = useAccount();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();
  const location = useLocation();

  const [errorMessage, setErrorMessage] = useState('');

  const searchParams = location.search;

  if (!location.state) {
    navigate(`/reset_password${searchParams}`);
  }

  const {
    code,
    email,
    token,
    accountResetToken,
    emailToHashWith,
    kB,
    recoveryKeyId,
  } = location.state as CompleteResetPasswordLocationState;

  const hasConfirmedRecoveryKey = !!(
    accountResetToken &&
    email &&
    kB &&
    recoveryKeyId
  );

  const isResetWithoutRecoveryKey = !!(code && token);

  const handleNavigationWithRecoveryKey = () => {
    navigate(`/reset_password_with_recovery_key_verified${searchParams}`);
  };

  const handleNavigationWithoutRecoveryKey = () => {
    navigate(`/reset_password_verified${searchParams}`, {
      replace: true,
    });
  };

  const resetPasswordWithRecoveryKey = async (
    accountResetToken: string,
    emailToUse: string,
    kB: string,
    newPassword: string,
    recoveryKeyId: string
  ) => {
    const options = {
      accountResetToken,
      emailToHashWith: emailToUse,
      password: newPassword,
      recoveryKeyId,
      kB,
    };

    // TODO in FXA-9672: do not use Account model in reset password pages
    const accountResetData = await account.resetPasswordWithRecoveryKey(
      options
    );

    return accountResetData;
  };

  const resetPasswordWithoutRecoveryKey = async (
    code: string,
    emailToUse: string,
    newPassword: string,
    token: string
  ) => {
    // TODO in FXA-9672: do not use Account model in reset password pages
    const accountResetData: AccountResetData =
      await account.completeResetPassword(
        keyStretchExperiment.queryParamModel.isV2(config),
        token,
        code,
        emailToUse,
        newPassword,
        accountResetToken
      );
    return accountResetData;
  };

  const notifyBrowserOfSignin = async (accountResetData: AccountResetData) => {
    if (integration.isSync()) {
      firefox.fxaLoginSignedInUser({
        authAt: accountResetData.authAt,
        email,
        keyFetchToken: accountResetData.keyFetchToken,
        sessionToken: accountResetData.sessionToken,
        uid: accountResetData.uid,
        unwrapBKey: accountResetData.unwrapBKey,
        verified: accountResetData.verified,
      });
    }
  };

  const submitNewPassword = async (newPassword: string) => {
    try {
      // The `emailToHashWith` option is returned by the auth-server to let the front-end
      // know what to hash the new password with. This is important in the scenario where a user
      // has changed their primary email address. In this case, they must still hash with the
      // account's original email because this will maintain backwards compatibility with
      // how account password hashing works previously.
      const emailToUse = emailToHashWith || email;

      if (hasConfirmedRecoveryKey) {
        GleanMetrics.resetPassword.recoveryKeyCreatePasswordSubmit();
        const accountResetData = await resetPasswordWithRecoveryKey(
          accountResetToken,
          emailToUse,
          kB,
          newPassword,
          recoveryKeyId
        );
        // TODO add frontend Glean event for successful reset?
        notifyBrowserOfSignin(accountResetData);
        handleNavigationWithRecoveryKey();
      } else if (isResetWithoutRecoveryKey) {
        GleanMetrics.resetPassword.createNewSubmit();
        const accountResetData = await resetPasswordWithoutRecoveryKey(
          code,
          emailToUse,
          newPassword,
          token
        );
        // TODO add frontend Glean event for successful reset?
        notifyBrowserOfSignin(accountResetData);
        handleNavigationWithoutRecoveryKey();
      }
    } catch (err) {
      const localizedBannerMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        err
      );
      setErrorMessage(localizedBannerMessage);
    }
  };

  // handle the case where we don't have all data required
  if (!(hasConfirmedRecoveryKey || isResetWithoutRecoveryKey)) {
    navigate(`/reset_password${searchParams}`);
  }
  return (
    <CompleteResetPassword
      {...{
        email,
        errorMessage,
        searchParams,
        submitNewPassword,
        hasConfirmedRecoveryKey,
      }}
      locationState={location.state as CompleteResetPasswordLocationState}
    />
  );
};

export default CompleteResetPasswordContainer;
