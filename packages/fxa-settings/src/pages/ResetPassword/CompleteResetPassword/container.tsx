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
  const isOAuth = isOAuthIntegration(integration);

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
    recoveryKeyId,
    recoveryKeyExists,
    estimatedSyncDeviceCount,
  } = location.state as CompleteResetPasswordLocationState;

  const kB = sensitiveDataClient.getDataType(
    SensitiveData.Key.DecryptedRecoveryKey
  )?.kB;

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
      if (isOAuth && !integration.isSync()) {
        sensitiveDataClient.setDataType(SensitiveData.Key.AccountReset, {
          keyFetchToken: accountResetData.keyFetchToken,
          unwrapBKey: accountResetData.unwrapBKey,
        });
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
      isFirefoxMobileClient: integration.isFirefoxMobileClient(),
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

  const notifyClientOfSignin = async (accountResetData: AccountResetData) => {
    // Users will not be verified if they have 2FA. If this is the case, users are
    // taken back to `/signin`, where they can sign in with 2FA and login to Sync.
    if (!accountResetData.verified) {
      return;
    }

    storeAccountData({
      uid: accountResetData.uid,
      email,
      lastLogin: Date.now(),
      sessionToken: accountResetData.sessionToken,
      verified: accountResetData.verified,
    });

    // This handles the sync desktop v3 case and the sync oauth_webchannel_v1 case.
    // Other oauth flows are handled in the next step.
    if (integration.isSync()) {
      firefox.fxaLoginSignedInUser({
        authAt: accountResetData.authAt,
        email,
        sessionToken: accountResetData.sessionToken,
        uid: accountResetData.uid,
        verified: accountResetData.verified,
        // Do not send these values if OAuth. Mobile doesn't care about this message, and
        // sending these values can cause intermittent sync disconnect issues in oauth desktop.
        ...(!isOAuth && {
          // keyFetchToken and unwrapBKey should always exist if Sync integration
          keyFetchToken: accountResetData.keyFetchToken,
          unwrapBKey: accountResetData.unwrapBKey,
        }),
        services: integration.isDesktopRelay() ? { relay: {} } : { sync: {} },
      });

      if (isOAuth) {
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
        // Mobile will close the web view
        firefox.fxaOAuthLogin({
          action: 'signin',
          code,
          redirect,
          state,
        });
      }
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
        await notifyClientOfSignin(accountResetData);

        // Mobile will automatically close the web view after notifyClientOfSignin
        // is called. We don't want to automatically generate a recovery key for these
        // users because they won't be able to see it.
        if (!integration.isFirefoxMobileClient()) {
          sensitiveDataClient.setDataType(
            SensitiveData.Key.AccountReset,
            accountResetData
          );

          // we cannot create a new recovery key if the session is not verified
          if (accountResetData.verified) {
            await account.refresh('account');
            const recoveryKey = await account.createRecoveryKey(newPassword);
            sensitiveDataClient.setDataType(SensitiveData.Key.NewRecoveryKey, {
              recoveryKey,
            });
          }

          handleNavigationWithRecoveryKey(
            { email: emailToUse },
            accountResetData.verified
          );
        }
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
        await notifyClientOfSignin(accountResetData);

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
        err
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
