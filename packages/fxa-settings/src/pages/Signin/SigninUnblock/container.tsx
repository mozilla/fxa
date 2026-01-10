/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';

import VerificationMethods from '../../../constants/verification-methods';
import VerificationReasons from '../../../constants/verification-reasons';
import {
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';

import { SigninUnblockIntegration } from '../interfaces';

import SigninUnblock from '.';
import {
  BeginSigninWithUnblockCodeHandler,
  ResendUnblockCodeHandler,
  SigninUnblockLocationState,
} from './interfaces';
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
import { tryFinalizeUpgrade } from '../../../lib/auth-key-stretch-upgrade';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import AppLayout from '../../../components/AppLayout';

export const SigninUnblockContainer = ({
  integration,
  flowQueryParams,
  setCurrentSplitLayout,
}: {
  integration: SigninUnblockIntegration;
  flowQueryParams: QueryParams;
  setCurrentSplitLayout?: (value: boolean) => void;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

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
        const result = await authClient.getCredentialStatusV2(email);
        return result;
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
      const response = await authClient.signInWithAuthPW(
        authEmail,
        credentials.authPW,
        options
      );

      if (response) {
        sensitiveDataClient.setDataType(SensitiveData.Key.Auth, {
          // Store for inline recovery key flow
          authPW: credentials.authPW,
          // Store this in case the email was corrected
          emailForAuth: email,
          unwrapBKey: credentials.unwrapBKey,
          keyFetchToken: response.keyFetchToken,
        });
      }

      const emailVerified = response?.emailVerified ?? false;
      const sessionVerified = response?.sessionVerified ?? false;
      const sessionToken = response?.sessionToken;
      // Attempt to finish key stretching upgrade now that session has been verified.
      if (emailVerified && sessionVerified && sessionToken) {
        await tryFinalizeUpgrade(
          sessionToken,
          sensitiveDataClient,
          'signin-unblock',
          authClient
        );
      }

      // Transform response to match expected format
      return {
        data: response
          ? {
              signIn: {
                uid: response.uid,
                sessionToken: response.sessionToken,
                authAt: response.authAt,
                metricsEnabled: response.metricsEnabled ?? true,
                emailVerified: response.emailVerified ?? false,
                sessionVerified: response.sessionVerified ?? false,
                verificationMethod: (response.verificationMethod || VerificationMethods.EMAIL_OTP) as VerificationMethods,
                verificationReason: response.verificationReason as VerificationReasons,
                keyFetchToken: response.keyFetchToken,
              },
              unwrapBKey: credentials.unwrapBKey,
            }
          : undefined,
      };
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

  const cmsInfo = integration.getCmsInfo();
  const splitLayout = cmsInfo?.SigninUnblockCodePage?.splitLayout;

  if (!email || !password) {
    navigateWithQuery('/');
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
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
        setCurrentSplitLayout,
      }}
    />
  );
};

export default SigninUnblockContainer;
