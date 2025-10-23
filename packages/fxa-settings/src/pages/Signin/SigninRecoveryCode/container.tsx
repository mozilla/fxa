/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback } from 'react';
import SigninRecoveryCode from '.';
import OAuthDataError from '../../../components/OAuthDataError';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { getHandledError } from '../../../lib/error-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import {
  Integration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import { SigninLocationState } from '../interfaces';
import { getSigninState } from '../utils';
import { CONSUME_RECOVERY_CODE_MUTATION } from './gql';
import { ConsumeRecoveryCodeResponse, SubmitRecoveryCode } from './interfaces';

type SigninRecoveryCodeLocationState = {
  signinState: SigninLocationState;
  lastFourPhoneDigits: string;
};

export type SigninRecoveryCodeContainerProps = {
  integration: Integration;
};

export const SigninRecoveryCodeContainer = ({
  integration,
}: SigninRecoveryCodeContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  const location =
    (useLocation() as ReturnType<typeof useLocation> & {
      state: SigninRecoveryCodeLocationState;
    }) || {};
  const navigateWithQuery = useNavigateWithQuery();
  const signinState = getSigninState(location.state?.signinState);
  const lastFourPhoneDigits = location.state?.lastFourPhoneDigits;
  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  const [consumeRecoveryCode] = useMutation<ConsumeRecoveryCodeResponse>(
    CONSUME_RECOVERY_CODE_MUTATION
  );

  const submitRecoveryCode: SubmitRecoveryCode = useCallback(
    async (recoveryCode: string) => {
      try {
        // this mutation returns the number of remaining codes,
        // if remaining codes is 0, we may want to redirect to the new code set up
        // or show a message that the user has no more codes
        const { data } = await consumeRecoveryCode({
          variables: { input: { code: recoveryCode } },
        });

        return { data };
      } catch (error) {
        return getHandledError(error);
      }
    },
    [consumeRecoveryCode]
  );

  const navigateToRecoveryPhone = async () => {
    if (!signinState) {
      return;
    }
    try {
      await authClient.recoveryPhoneSigninSendCode(signinState.sessionToken);
      navigateWithQuery('/signin_recovery_phone', {
        state: { signinState, lastFourPhoneDigits },
      });
      return;
    } catch (error) {
      const { error: handledError } = getHandledError(error);
      if (handledError.errno === AuthUiErrors.INVALID_TOKEN.errno) {
        navigateWithQuery('/signin');
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

  if (!signinState) {
    navigateWithQuery('/');
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SigninRecoveryCode
      {...{
        finishOAuthFlowHandler,
        integration,
        keyFetchToken,
        lastFourPhoneDigits,
        navigateToRecoveryPhone,
        signinState,
        submitRecoveryCode,
        unwrapBKey,
      }}
    />
  );
};

export default SigninRecoveryCodeContainer;
