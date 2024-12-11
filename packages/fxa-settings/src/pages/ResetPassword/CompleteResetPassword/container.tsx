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
  useAuthClient,
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
import { LocationState } from '../../Signin/interfaces';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import OAuthDataError from '../../../components/OAuthDataError';
import { SensitiveData } from '../../../lib/sensitive-data-client';

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
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

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

  const handleNavigationWithRecoveryKey = (
    state: Record<string, any>,
    hasVerifiedSession: boolean
  ) => {
    if (!hasVerifiedSession) {
      return navigateWithQuery('/signin', {
        replace: true,
        state: {
          email,
          successBanner: {
            localizedSuccessBannerHeading: ftlMsgResolver.getMsg(
              'reset-password-complete-banner-heading',
              'Your password has been reset.'
            ),
            localizedSuccessBannerDescription: ftlMsgResolver.getMsg(
              'reset-password-complete-banner-message',
              'Don’t forget to generate a new account recovery key from your Mozilla account settings to prevent future sign-in issues.'
            ),
          } as LocationState,
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
        sensitiveDataClient.setDataType(
          SensitiveData.Key.AccountReset, {
            keyFetchToken: accountResetData.keyFetchToken,
            unwrapBKey: accountResetData.unwrapBKey,
          }
        );
        return navigateWithQuery('/reset_password_verified', {
          replace: true,
        });
      }

      // For web integration and sync navigate to settings
      // Sync users will see an account recovery key promotion banner in settings
      // if they don't have one configured
      alertBar.success(
        ftlMsgResolver.getMsg(
          'reset-password-complete-header',
          'Your password has been reset'
        )
      );
      return navigateWithQuery(SETTINGS_PATH, { replace: true });
    }

    // if the session is not verified (e.g., 2FA verification is required), navigate to the sign-in page
    return navigateWithQuery('/signin', {
      replace: true,
      state: {
        email,
        successBanner: {
          localizedSuccessBannerHeading: ftlMsgResolver.getMsg(
            'reset-password-complete-banner-heading',
            'Your password has been reset.'
          ),
        },
      } as LocationState,
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
        ...(!integration.isDesktopRelay() && {
          services: {
            sync: {},
          },
        }),
      });
    }
  };

  // We send an oauth_login web channel message when we are in
  // an oauth flow and the integration is for sync.
  // This is needed to ensure that Sync is turned on after a password reset.
  //
  // N.B: the call site is only when the flow is not using a recovery key. For the other case,
  // the message is sent later in the flow.
  const maybeNotifyOAuthClient = async (accountResetData: AccountResetData) => {
    if (!isOAuthIntegration(integration)) {
      return;
    }

    if (integration.isSync()) {
      const { error, redirect, code, state } = await finishOAuthFlowHandler(
        accountResetData.uid,
        accountResetData.sessionToken,
        accountResetData.keyFetchToken,
        accountResetData.unwrapBKey
      );

      if (error) {
        const localizedBannerMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        setErrorMessage(localizedBannerMessage);
        return;
      }
      firefox.fxaOAuthLogin({
        action: 'signin',
        code: code,
        redirect: redirect,
        state: state,
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

        sensitiveDataClient.setDataType(
          SensitiveData.Key.AccountReset,
          accountResetData
        );

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
        await maybeNotifyOAuthClient(accountResetData);

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

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
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
