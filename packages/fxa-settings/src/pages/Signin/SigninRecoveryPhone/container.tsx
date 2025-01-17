/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import SigninRecoveryPhone from '.';
import { SigninLocationState } from '../interfaces';
import { getSigninState, handleNavigation } from '../utils';
import {
  Integration,
  isWebIntegration,
  useAuthClient,
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

interface SigninRecoveryPhoneContainerProps {
  integration: Integration;
}

interface SigninRecoveryPhoneLocationState extends SigninLocationState {
  signinState: SigninLocationState;
  lastFourPhoneDigits: string;
}

const SigninRecoveryPhoneContainer = ({
  integration,
}: SigninRecoveryPhoneContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninRecoveryPhoneLocationState;
  };
  const signinState = getSigninState(
    location.state?.signinState as SigninLocationState
  );
  const lastFourPhoneDigits = location.state?.lastFourPhoneDigits;
  const navigateWithQuery = useNavigateWithQuery();

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
    unwrapBKey
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

    try {
      storeAccountData({
        sessionToken: signinState.sessionToken,
        email: signinState.email,
        uid: signinState.uid,
        // Update verification status of stored current account
        verified: true,
      });

      const navigationOptions = {
        email: signinState.email,
        signinData: {
          uid: signinState.uid,
          sessionToken: signinState.sessionToken,
          verificationReason: signinState.verificationReason,
          verificationMethod: signinState.verificationMethod,
          verified: true,
          keyFetchToken,
        },
        unwrapBKey,
        integration,
        finishOAuthFlowHandler,
        redirectTo,
        queryParams: location.search,
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
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
      }}
    />
  );
};

export default SigninRecoveryPhoneContainer;
