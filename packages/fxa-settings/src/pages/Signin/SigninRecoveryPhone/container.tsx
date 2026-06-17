/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import SigninRecoveryPhone from '.';
import { getSigninState, handleNavigation } from '../utils';
import {
  isWebIntegration,
  useAlertBar,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { getHandledError } from '../../../lib/error-utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import OAuthDataError from '../../../components/OAuthDataError';
import { storeAccountData } from '../../../lib/storage-utils';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import {
  SigninRecoveryPhoneContainerProps,
  SigninRecoveryPhoneLocationState,
} from './interfaces';
import { setStoredSignedInStatus } from '../../../models/Session';
import GleanMetrics from '../../../lib/glean';
import { SigninLocationState } from '../interfaces';

const SigninRecoveryPhoneContainer = ({
  integration,
  setCurrentSplitLayout,
  supportsKeysOptionalLogin,
}: SigninRecoveryPhoneContainerProps) => {
  const alertBar = useAlertBar();
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninRecoveryPhoneLocationState;
  };
  const signinState = getSigninState(
    location.state?.signinState as SigninLocationState
  );
  const lastFourPhoneDigits = location.state?.lastFourPhoneDigits;
  const numBackupCodes = location.state?.numBackupCodes;
  const navigateWithQuery = useNavigateWithQuery();
  const navigate = useNavigate();
  const sendError = location.state?.sendError;

  useEffect(() => {
    if (!signinState || !signinState.sessionToken || !lastFourPhoneDigits) {
      navigateWithQuery('/signin');
      return;
    }
  });

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey,
    signinState?.isSignInWithThirdPartyAuth ||
      signinState?.isPasswordlessOtpSignin
  );

  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const redirectTo =
    isWebIntegration(integration) && webRedirectCheck?.isValid
      ? integration.data.redirectTo
      : '';

  const handleSuccess = async () => {
    if (!signinState) {
      return;
    }

    const isPasswordlessSignin =
      signinState.isPasswordlessOtpSignin ||
      signinState.isSignInWithThirdPartyAuth;

    try {
      storeAccountData({
        sessionToken: signinState.sessionToken,
        email: signinState.email,
        uid: signinState.uid,
        // Update verification status of stored current account
        verified: true,
        sessionVerified: true,
        // OTP sign-in is the only genuinely passwordless case; a third-party
        // account may have a password, so leave it unset and let SetPassword verify.
        ...(signinState.isPasswordlessOtpSignin && { hasPassword: false }),
      });

      setStoredSignedInStatus(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Recovery-phone verification succeeded; record it before any redirect so
      // the success funnel matches the TOTP and backup-code flows.
      GleanMetrics.login.recoveryPhoneSuccessView();

      // Passwordless sign-in needing keys must set a password first;
      // defer the success alert and browser login messages.
      if (
        isPasswordlessSignin &&
        integration.requiresPasswordForLogin(supportsKeysOptionalLogin)
      ) {
        navigateWithQuery('/post_verify/set_password', {
          replace: true,
          state: {
            passwordCreationReason: signinState.isSignInWithThirdPartyAuth
              ? 'third_party_auth'
              : 'otp',
          },
        });
        return;
      }

      alertBar.success(
        ftlMsgResolver.getMsg(
          'signin-recovery-phone-success-message',
          'Signed in successfully. Limits may apply if you use your recovery phone again.'
        )
      );

      const navigationOptions = {
        navigate,
        email: signinState.email,
        signinData: {
          uid: signinState.uid,
          sessionToken: signinState.sessionToken,
          verificationReason: signinState.verificationReason,
          verificationMethod: signinState.verificationMethod,
          emailVerified: true,
          sessionVerified: true,
          keyFetchToken,
        },
        unwrapBKey,
        integration,
        finishOAuthFlowHandler,
        redirectTo,
        queryParams: location.search,
        isSessionAALUpgrade: signinState.isSessionAALUpgrade,
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
        performNavigation: !integration.isFirefoxMobileClient(),
        authClient,
      };

      await handleNavigation(navigationOptions);
    } catch (error) {
      throw error;
    }
  };

  const verifyCode = async (otpCode: string) => {
    if (!signinState) {
      return;
    }
    try {
      await authClient.recoveryPhoneSigninConfirm(
        signinState.sessionToken,
        otpCode
      );
      await handleSuccess();
      return;
    } catch (err) {
      const { error: handledError } = getHandledError(err);
      if (handledError.errno === AuthUiErrors.INVALID_TOKEN.errno) {
        navigateWithQuery('/signin', { replace: true });
        return;
      }
      return handledError;
    }
  };

  const resendCode = async () => {
    if (!signinState) {
      return;
    }
    try {
      await authClient.recoveryPhoneSigninSendCode(signinState.sessionToken);
      return;
    } catch (err) {
      const { error: handledError } = getHandledError(err);
      if (handledError.errno === AuthUiErrors.INVALID_TOKEN.errno) {
        navigateWithQuery('/signin', { replace: true });
        return;
      }
      return handledError;
    }
  };

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (oAuthKeysCheckError) {
    return <OAuthDataError error={oAuthKeysCheckError} />;
  }

  return (
    <SigninRecoveryPhone
      {...{
        lastFourPhoneDigits,
        verifyCode,
        resendCode,
        sendError,
        numBackupCodes,
        integration,
        signinState,
        setCurrentSplitLayout,
      }}
    />
  );
};

export default SigninRecoveryPhoneContainer;
