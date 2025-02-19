/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';

import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import VerificationMethods from '../../../constants/verification-methods';
import {
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
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
  SigninUnblockIntegration,
} from '../interfaces';

import SigninUnblock from '.';
import {
  BeginSigninWithUnblockCodeHandler,
  ResendUnblockCodeHandler,
  SigninUnblockLocationState,
} from './interfaces';
import { hardNavigate } from 'fxa-react/lib/utils';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
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
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { isFirefoxService } from '../../../models/integrations/utils';
import { tryFinalizeUpgrade } from '../../../lib/gql-key-stretch-upgrade';
import { useCheckReactEmailFirst } from '../../../lib/hooks';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';

export const SigninUnblockContainer = ({
  integration,
  flowQueryParams,
}: {
  integration: SigninUnblockIntegration;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();
  const shouldUseReactEmailFirst = useCheckReactEmailFirst();

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninUnblockLocationState;
  };

  const sensitiveDataClient = useSensitiveDataClient();
  // We keep the previous non-null assertion on 'password' here because the
  // flow dictates we definitely have it.
  const { plainTextPassword: password } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Password)! || {};

  const { email, hasLinkedAccount, hasPassword } = location.state || {};

  const wantsTwoStepAuthentication = integration.wantsTwoStepAuthentication();

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const [beginSignin] = useMutation<BeginSigninResponse>(BEGIN_SIGNIN_MUTATION);
  const [credentialStatus] = useMutation<CredentialStatusResponse>(
    CREDENTIAL_STATUS_MUTATION
  );
  const [passwordChangeStart] = useMutation<PasswordChangeStartResponse>(
    PASSWORD_CHANGE_START_MUTATION
  );
  const [getWrappedKeys] = useMutation<GetAccountKeysResponse>(
    GET_ACCOUNT_KEYS_MUTATION
  );
  const [passwordChangeFinish] = useMutation<PasswordChangeFinishResponse>(
    PASSWORD_CHANGE_FINISH_MUTATION
  );

  const signinWithUnblockCode: BeginSigninWithUnblockCodeHandler = async (
    unblockCode: string,
    authEmail: string = email,
    signInOptions?: SignInOptions
  ) => {
    const service = integration.getService();
    const clientId = integration.getClientId();

    const options: SignInOptions = signInOptions ?? {
      verificationMethod: VerificationMethods.EMAIL_OTP,
      keys: integration.wantsKeys(),
      // See oauth_client_info in the auth-server for details on service/clientId
      // Sending up the clientId when the user is not signing in to the browser
      // is used to show the correct service name in emails
      ...(isFirefoxService(service) ? { service } : { service: clientId }),
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
        // In the event there's a downstream error, this could be useful a breadcrumb to capture.
        console.warn('Could not get credential status!');
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

      // Attempt to finish key stretching upgrade now that session has been verified.
      if (response.data?.signIn.verified) {
        await tryFinalizeUpgrade(
          response.data?.signIn.sessionToken,
          sensitiveDataClient,
          'signin-unblock',
          credentialStatus,
          getWrappedKeys,
          passwordChangeStart,
          passwordChangeFinish
        );
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
      sensitiveDataClient.setDataType(SensitiveData.Key.Auth, undefined);
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
    if (shouldUseReactEmailFirst) {
      navigate('/');
    } else {
      hardNavigate('/', {}, true);
    }
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
