/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';

import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import {
  Integration,
  isOAuthIntegration,
  useAccount,
  useAlertBar,
  useConfig,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';
import { KeyStretchExperiment } from '../../../models/experiments';

import CompleteResetPassword from '.';
import {
  AccountResetData,
  CompleteResetPasswordLocationState,
} from './interfaces';
import GleanMetrics from '../../../lib/glean';
import firefox from '../../../lib/channels/firefox';
import { useState } from 'react';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { storeAccountData } from '../../../lib/storage-utils';
import { SETTINGS_PATH } from '../../../constants';

// This component is used for both /complete_reset_password and /account_recovery_reset_password routes
// for easier maintenance

const CompleteResetPasswordContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const keyStretchExperiment = useValidatedQueryParams(KeyStretchExperiment);

  const account = useAccount();
  const alertBar = useAlertBar();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation();
  const sensitiveDataClient = useSensitiveDataClient();

  const [errorMessage, setErrorMessage] = useState('');

  if (!location.state) {
    navigateWithQuery('/reset_password', { replace: true });
    return;
  }

  const {
    code,
    email,
    token,
    accountResetToken,
    emailToHashWith,
    kB,
    recoveryKeyId,
    recoveryKeyExists,
    estimatedSyncDeviceCount,
  } = location.state as CompleteResetPasswordLocationState;

  const hasConfirmedRecoveryKey = !!(
    accountResetToken &&
    email &&
    kB &&
    recoveryKeyId
  );

  const isResetWithoutRecoveryKey = !!(code && token);

  const isSyncUser =
    integration.isSync() ||
    (estimatedSyncDeviceCount && estimatedSyncDeviceCount > 0);

  const localizedSuccessMessage = ftlMsgResolver.getMsg(
    'reset-password-complete-header',
    'Your password has been reset'
  );

  const successBannerMessageHeading = ftlMsgResolver.getMsg(
    'reset-password-complete-banner-heading',
    'Your password has been reset.'
  );
  const successBannerMessageMessage = ftlMsgResolver.getMsg(
    'reset-password-complete-banner-message',
    'Don’t forget to generate a new account recovery key from your Mozilla account settings to prevent future sign-in issues.'
  );

  const handleNavigationWithRecoveryKey = (
    state: Record<string, any>,
    hasVerifiedSession: boolean
  ) => {
    if (!hasVerifiedSession) {
      return navigateWithQuery('/signin', {
        replace: true,
        state: {
          email,
          fancyBannerSuccessMessage: {
            heading: successBannerMessageHeading,
            message: successBannerMessageMessage,
          },
        },
      });
    } else {
      return navigateWithQuery('/reset_password_with_recovery_key_verified', {
        state,
      });
    }
  };

  const handleNavigationWithoutRecoveryKey = async (
    accountResetData: AccountResetData
  ) => {
    if (accountResetData.verified) {
      // For verified users with OAuth integration, navigate to confirmation page then to the relying party
      if (isOAuthIntegration(integration) && !integration.isSync()) {
        const sensitiveData = { ...accountResetData, email };
        sensitiveDataClient.setData('accountResetData', sensitiveData);
        return navigateWithQuery('/reset_password_verified', {
          replace: true,
        });
      }

      // For web integration and sync navigate to settings
      // Sync users will see an account recovery key promotion banner in settings
      // if they don't have one configured
      alertBar.success(localizedSuccessMessage);
      return navigateWithQuery(SETTINGS_PATH, { replace: true });
    }

    // if the session is not verified (e.g., 2FA verification is required), navigate to the sign-in page
    return navigateWithQuery('/signin', {
      replace: true,
      state: {
        email,
        bannerSuccessMessage: localizedSuccessMessage,
      },
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
    token: string,
    includeRecoveryKeyPrompt: boolean
  ) => {
    // TODO in FXA-9672: do not use Account model in reset password pages
    const accountResetData: AccountResetData =
      await account.completeResetPassword(
        keyStretchExperiment.queryParamModel.isV2(config),
        token,
        code,
        emailToUse,
        newPassword,
        undefined,
        undefined,
        includeRecoveryKeyPrompt
      );
    return accountResetData;
  };

  const notifyClientOfSignin = (accountResetData: AccountResetData) => {
    if (accountResetData.verified) {
      storeAccountData({
        uid: accountResetData.uid,
        email,
        lastLogin: Date.now(),
        sessionToken: accountResetData.sessionToken,
        verified: accountResetData.verified,
      });
    }

    if (integration.isSync()) {
      firefox.fxaLoginSignedInUser({
        authAt: accountResetData.authAt,
        email,
        keyFetchToken: accountResetData.keyFetchToken,
        sessionToken: accountResetData.sessionToken,
        uid: accountResetData.uid,
        unwrapBKey: accountResetData.unwrapBKey,
        verified: accountResetData.verified,
        services: {
          sync: {},
        },
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
        GleanMetrics.passwordReset.recoveryKeyCreatePasswordSubmit();
        const accountResetData = await resetPasswordWithRecoveryKey(
          accountResetToken,
          emailToUse,
          kB,
          newPassword,
          recoveryKeyId
        );

        // TODO add frontend Glean event for successful reset?
        notifyClientOfSignin(accountResetData);

        sensitiveDataClient.setData('accountResetData', accountResetData);

        // we cannot create a new recovery key if the session is not verified
        if (accountResetData.verified) {
          await account.refresh('account');
          const createRecoveryKeyResult = await account.createRecoveryKey(
            newPassword
          );
          sensitiveDataClient.setData(
            'newRecoveryKeyData',
            createRecoveryKeyResult
          );
        }

        handleNavigationWithRecoveryKey(
          { email: emailToUse },
          accountResetData.verified
        );
      } else if (isResetWithoutRecoveryKey) {
        GleanMetrics.passwordReset.createNewSubmit();
        const includeRecoveryKeyPrompt = !!isSyncUser;
        const accountResetData = await resetPasswordWithoutRecoveryKey(
          code,
          emailToUse,
          newPassword,
          token,
          includeRecoveryKeyPrompt
        );
        // TODO add frontend Glean event for successful reset?
        notifyClientOfSignin(accountResetData);

        // DO NOT REMOVE THIS MAKES THE NAVIGATION WORK
        // Despite all the awaiting in the code path, the signed in state in
        // the apollo client cache does not seem to update before the re-render
        // from the navigate call.
        await new Promise((resolve) => setTimeout(resolve, 0));
        await handleNavigationWithoutRecoveryKey(accountResetData);
      }
    } catch (err) {
      const localizedBannerMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        err.error
      );
      setErrorMessage(localizedBannerMessage);
    }
  };

  // handle the case where we don't have all data required
  if (!(hasConfirmedRecoveryKey || isResetWithoutRecoveryKey)) {
    navigateWithQuery('/reset_password', { replace: true });
  }

  return (
    <CompleteResetPassword
      {...{
        email,
        errorMessage,
        submitNewPassword,
        hasConfirmedRecoveryKey,
        recoveryKeyExists,
        estimatedSyncDeviceCount,
      }}
      integrationIsSync={integration.isSync()}
      locationState={location.state as CompleteResetPasswordLocationState}
    />
  );
};

export default CompleteResetPasswordContainer;
