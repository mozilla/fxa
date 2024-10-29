/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';

import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import VerificationMethods from '../../../constants/verification-methods';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';

// using default signin handlers
import { BEGIN_SIGNIN_MUTATION, CREDENTIAL_STATUS_MUTATION } from '../gql';
import { BeginSigninResponse, CredentialStatusResponse } from '../interfaces';

import SigninUnblock from '.';
import {
  BeginSigninWithUnblockCodeHandler,
  ResendUnblockCodeHandler,
  SigninUnblockLocationState,
} from './interfaces';
import { hardNavigate } from 'fxa-react/lib/utils';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { MozServices } from '../../../lib/types';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import OAuthDataError from '../../../components/OAuthDataError';
import {
  getHandledError,
  getLocalizedErrorMessage,
} from '../../../lib/error-utils';
import { getCredentials, getCredentialsV2 } from 'fxa-auth-client/lib/crypto';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { SignInOptions } from 'fxa-auth-client/browser';
import { AUTH_DATA_KEY } from '../../../lib/sensitive-data-client';

const SigninUnblockContainer = ({
  integration,
  flowQueryParams,
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninUnblockLocationState;
  };

  const sensitiveDataClient = useSensitiveDataClient();
  const sensitiveData = sensitiveDataClient.getData(AUTH_DATA_KEY);
  const { password } = (sensitiveData as unknown as { password: string }) || {};

  const { email, hasLinkedAccount, hasPassword } = location.state || {};

  const wantsTwoStepAuthentication =
    isOAuthIntegration(integration) && integration.wantsTwoStepAuthentication();

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const [beginSignin] = useMutation<BeginSigninResponse>(BEGIN_SIGNIN_MUTATION);
  const [credentialStatus] = useMutation<CredentialStatusResponse>(
    CREDENTIAL_STATUS_MUTATION
  );

  const signinWithUnblockCode: BeginSigninWithUnblockCodeHandler = async (
    unblockCode: string,
    authEmail: string = email,
    signInOptions?: SignInOptions
  ) => {
    const service = integration.getService();
    const options: SignInOptions = signInOptions ?? {
      verificationMethod: VerificationMethods.EMAIL_OTP,
      keys: integration.wantsKeys(),
      ...(service !== MozServices.Default && { service }),
      unblockCode,
      metricsContext: queryParamsToMetricsContext(
        flowQueryParams as unknown as Record<string, string>
      ),
    };

    // Get credentials with the correct key version
    const status = await (async () => {
      try {
        const { data } = await credentialStatus({
          variables: {
            input: email,
          },
        });
        return data?.credentialStatus;
      } catch (err) {
        console.warn('Could not get credential status!', {
          err,
        });
      }
      return undefined;
    })();

    const credentials = await (async () => {
      const currentVersion = status?.currentVersion;
      if (currentVersion === 'v2') {
        const clientSalt = status?.clientSalt || '';
        return await getCredentialsV2({ password, clientSalt });
      }
      return await getCredentials(authEmail, password);
    })();

    try {
      const response = await beginSignin({
        variables: {
          input: {
            email: authEmail,
            authPW: credentials.authPW,
            options,
          },
        },
      });
      if (response.data != null) {
        response.data.unwrapBKey = credentials.unwrapBKey;
      }
      return response;
    } catch (error) {
      const result = getHandledError(error);
      if (
        'error' in result &&
        result.error.errno === AuthUiErrors.INCORRECT_EMAIL_CASE.errno &&
        'email' in result.error &&
        result.error.email != null &&
        result.error.email !== email
      ) {
        options.skipCaseError = true;
        options.originalLoginEmail = email;
        // Try one more time with the corrected email
        return await signinWithUnblockCode(
          unblockCode,
          result.error.email,
          options
        );
      }

      return result;
    } finally {
      sensitiveDataClient.setData(AUTH_DATA_KEY, null);
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
