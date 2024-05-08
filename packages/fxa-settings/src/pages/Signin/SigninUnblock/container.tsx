/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';

import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { KeyStretchExperiment } from '../../../models/experiments/key-stretch-experiment';

import VerificationMethods from '../../../constants/verification-methods';
import { getLocalizedErrorMessage } from '../../../lib/auth-errors/auth-errors';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
  useFtlMsgResolver,
  useConfig,
} from '../../../models';

// using default signin handlers
import {
  BEGIN_SIGNIN_MUTATION,
  CREDENTIAL_STATUS_MUTATION,
  GET_ACCOUNT_KEYS_MUTATION,
  PASSWORD_CHANGE_FINISH_MUTATION,
  PASSWORD_CHANGE_START_MUTATION,
} from '../gql';
import {
  BeginSigninResponse,
  CredentialStatusResponse,
  GetAccountKeysResponse,
  PasswordChangeFinishResponse,
  PasswordChangeStartResponse,
} from '../interfaces';

import SigninUnblock from '.';
import {
  BeginSigninWithUnblockCodeHandler,
  ResendUnblockCodeHandler,
  SigninUnblockLocationState,
} from './interfaces';
import { getHandledError } from '../utils';
import { hardNavigate } from 'fxa-react/lib/utils';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { MozServices } from '../../../lib/types';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import OAuthDataError from '../../../components/OAuthDataError';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { trySignIn, tryKeyStretchingUpgrade } from '../container';

const SigninUnblockContainer = ({
  integration,
  flowQueryParams,
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const config = useConfig();
  const keyStretchExp = useValidatedQueryParams(KeyStretchExperiment);

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninUnblockLocationState;
  };
  const { email, hasLinkedAccount, hasPassword, password } =
    location.state || {};

  const wantsTwoStepAuthentication =
    isOAuthIntegration(integration) && integration.wantsTwoStepAuthentication();

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const [credentialStatus] = useMutation<CredentialStatusResponse>(
    CREDENTIAL_STATUS_MUTATION
  );

  const [passwordChangeStart] = useMutation<PasswordChangeStartResponse>(
    PASSWORD_CHANGE_START_MUTATION
  );

  const [passwordChangeFinish] = useMutation<PasswordChangeFinishResponse>(
    PASSWORD_CHANGE_FINISH_MUTATION
  );

  const [getWrappedKeys] = useMutation<GetAccountKeysResponse>(
    GET_ACCOUNT_KEYS_MUTATION
  );

  const [beginSignin] = useMutation<BeginSigninResponse>(BEGIN_SIGNIN_MUTATION);

  const signinWithUnblockCode: BeginSigninWithUnblockCodeHandler = async (
    unblockCode: string
  ) => {
    const service = integration.getService();
    const options = {
      verificationMethod: VerificationMethods.EMAIL_OTP,
      keys: integration.wantsKeys(),
      ...(service !== MozServices.Default && { service }),
      unblockCode,
      metricsContext: queryParamsToMetricsContext(
        flowQueryParams as unknown as Record<string, string>
      ),
    };

    try {
      const { error, unverifiedAccount, v1Credentials, v2Credentials } =
        await tryKeyStretchingUpgrade(
          email,
          password,
          keyStretchExp.queryParamModel.isV2(config),
          credentialStatus,
          passwordChangeStart,
          getWrappedKeys,
          passwordChangeFinish
        );

      if (error) {
        return { error };
      }

      return await trySignIn(
        email,
        v1Credentials,
        v2Credentials,
        unverifiedAccount,
        beginSignin,
        options
      );
    } catch (error) {
      return getHandledError(error);
    }
  };

  const resendUnblockCodeHandler: ResendUnblockCodeHandler = async () => {
    try {
      await authClient.sendUnblockCode(email, {
        metricsContext: queryParamsToMetricsContext(
          flowQueryParams as unknown as Record<string, string>
        ),
      });
      return { success: true };
    } catch (error) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      return { success: false, localizedErrorMessage };
    }
  };

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (!email || !password) {
    hardNavigate('/', {}, true);
    return <LoadingSpinner fullScreen />;
  }
  return (
    <SigninUnblock
      {...{
        integration,
        email,
        hasLinkedAccount,
        hasPassword,
        signinWithUnblockCode,
        resendUnblockCodeHandler,
        wantsTwoStepAuthentication,
        finishOAuthFlowHandler,
      }}
    />
  );
};

export default SigninUnblockContainer;
