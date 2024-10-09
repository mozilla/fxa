/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import Signin from '.';
import {
  Integration,
  useAuthClient,
  useFtlMsgResolver,
  useConfig,
  useSession,
  useSensitiveDataClient,
} from '../../models';
import { MozServices } from '../../lib/types';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { SigninQueryParams } from '../../models/pages/signin';
import { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { cache, currentAccount, discardSessionToken } from '../../lib/cache';
import {
  FetchResult,
  MutationFunction,
  useMutation,
  useQuery,
} from '@apollo/client';
import {
  AVATAR_QUERY,
  BEGIN_SIGNIN_MUTATION,
  CREDENTIAL_STATUS_MUTATION,
  GET_ACCOUNT_KEYS_MUTATION,
  PASSWORD_CHANGE_FINISH_MUTATION,
  PASSWORD_CHANGE_START_MUTATION,
} from './gql';
import { hardNavigate } from 'fxa-react/lib/utils';
import {
  RecoveryEmailStatusResponse,
  AvatarResponse,
  BeginSigninHandler,
  BeginSigninResponse,
  CachedSigninHandler,
  LocationState,
  PasswordChangeStartResponse,
  GetAccountKeysResponse,
  PasswordChangeFinishResponse,
  CredentialStatusResponse,
} from './interfaces';
import {
  getCredentials,
  getCredentialsV2,
  getKeysV2,
  unwrapKB,
} from 'fxa-auth-client/lib/crypto';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import AuthenticationMethods from '../../constants/authentication-methods';
import { KeyStretchExperiment } from '../../models/experiments';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';
import * as Sentry from '@sentry/browser';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { searchParams } from '../../lib/utilities';
import { QueryParams } from '../..';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import OAuthDataError from '../../components/OAuthDataError';
import { MetricsContext } from 'fxa-auth-client/browser';
import { isEmailValid } from 'fxa-shared/email/helpers';
import {
  getHandledError,
  getLocalizedErrorMessage,
} from '../../lib/error-utils';
import { firefox } from '../../lib/channels/firefox';
import {
  AUTH_DATA_KEY,
  SensitiveDataClient,
} from '../../lib/sensitive-data-client';
import { Constants } from '../../lib/constants';

/*
 * In content-server, the `email` param is optional. If it's provided, we
 * check against it to see if the account exists and if it doesn't, we redirect
 * users to `/signup`.
 *
 * In the React version, we're temporarily always passing the `email` param over
 * from the Backbone index page until the index page is converted over, in which case
 * we can pass the param with router state. Since we already perform this account exists
 * (account status) check on the Backbone index page, which is rate limited since it doesn't
 * require a session token, we also temporarily pass email status params to 1) signal not to
 * perform the check again but also because 2) these params are needed to conditionally
 * display UI in signin. If no status params are passed and `email` is, or we read the
 * email from local storage, we perform the check and redirect existing user emails to
 * `/signup` to match content-server functionality.
 */

function getAccountInfo(email?: string) {
  let sessionToken: hexstring | undefined;
  let uid: hexstring | undefined;

  if (email) {
    const storedLocalAccount = currentAccount();
    // Try to use local storage values if email matches the email in local storage
    if (storedLocalAccount?.email && storedLocalAccount.email === email) {
      sessionToken = storedLocalAccount?.sessionToken;
      uid = storedLocalAccount?.uid;
    }
  }
  return { sessionToken, uid };
}

const SigninContainer = ({
  integration,
  serviceName,
  flowQueryParams,
}: {
  integration: Integration;
  serviceName: MozServices;
  flowQueryParams?: QueryParams;
} & RouteComponentProps) => {
  const config = useConfig();
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };
  const session = useSession();
  const sensitiveDataClient = useSensitiveDataClient();

  const { queryParamModel, validationError } =
    useValidatedQueryParams(SigninQueryParams);

  const keyStretchExp = useValidatedQueryParams(KeyStretchExperiment);

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  // email will either come from React (location state) or Backbone (query param)
  const {
    email: emailFromLocationState,
    // TODO: in FXA-9177, remove hasLinkedAccount and hasPassword, will be retrieved from Apollo cache
    hasLinkedAccount: hasLinkedAccountFromLocationState,
    hasPassword: hasPasswordFromLocationState,
    localizedErrorMessage: localizedErrorFromLocationState,
    bannerSuccessMessage,
  } = location.state || {};

  const [accountStatus, setAccountStatus] = useState({
    hasLinkedAccount:
      // TODO: in FXA-9177, retrieve hasLinkedAccount and hasPassword from Apollo cache (not state)
      queryParamModel.hasLinkedAccount || hasLinkedAccountFromLocationState,
    hasPassword: queryParamModel.hasPassword || hasPasswordFromLocationState,
  });
  const { hasLinkedAccount, hasPassword } = accountStatus;

  const email = queryParamModel.email || emailFromLocationState;

  const { sessionToken, uid } = getAccountInfo(email);

  const wantsKeys = integration.wantsKeys();

  useEffect(() => {
    (async () => {
      const queryParams = new URLSearchParams(location.search);
      // Tweak this once index page is converted to React
      if (!validationError && email) {
        // if you directly hit /signin with email param or we read from localstorage
        // this means the account status hasn't been checked
        if (
          accountStatus.hasLinkedAccount === undefined ||
          accountStatus.hasPassword === undefined
        ) {
          try {
            const { exists, hasLinkedAccount, hasPassword } =
              await authClient.accountStatusByEmail(email, {
                thirdPartyAuthStatus: true,
              });
            if (!exists) {
              // For now, just pass back emailStatusChecked. When we convert the Index page
              // we'll want to read from router state.
              queryParams.set('email', email);
              queryParams.set('emailStatusChecked', 'true');
              navigate(`/signup?${queryParams}`);
            } else {
              // TODO: in FXA-9177, also set hasLinkedAccount and hasPassword in Apollo cache
              setAccountStatus({
                hasLinkedAccount,
                hasPassword,
              });
            }
          } catch (error) {
            // Passing back the 'email' param causes various behaviors in
            // content-server since it marks the email as "coming from a RP".
            queryParams.delete('email');
            if (isEmailValid(email)) {
              queryParams.set('prefillEmail', email);
            }
            hardNavigate(`/?${queryParams}`);
          }
        }
      } else {
        // Passing back the 'email' param causes various behaviors in
        // content-server since it marks the email as "coming from a RP".
        queryParams.delete('email');
        if (email && isEmailValid(email)) {
          queryParams.set('prefillEmail', email);
        }
        const optionalParams = queryParams.size > 0 ? `?${queryParams}` : '';
        hardNavigate(`/${optionalParams}`);
      }
    })();
    // Only run this on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: avatarData, loading: avatarLoading } =
    useQuery<AvatarResponse>(AVATAR_QUERY);

  const [beginSignin] = useMutation<BeginSigninResponse>(BEGIN_SIGNIN_MUTATION);

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

  const beginSigninHandler: BeginSigninHandler = useCallback(
    async (email: string, password: string) => {
      // If queryParamModel.hasLinkedAccount is defined, then we know the user
      // came from email-first and was already prompted with the sync merge
      // warning. The browser will automatically respond with { ok: true } without
      // prompting the user if it matches the email the browser has data for.
      if (
        // NOTE, SYNC-4408 OAuth desktop needs to add `service=sync` as a query parameter
        // for this to work for OAuth desktop
        integration.data.service === 'sync' &&
        queryParamModel.hasLinkedAccount === undefined
      ) {
        const { ok } = await firefox.fxaCanLinkAccount({ email });
        if (!ok) {
          const error = {
            // TODO FXA-9757, these should never be undefined
            errno: AuthUiErrors.USER_CANCELED_LOGIN.errno!,
            message: AuthUiErrors.USER_CANCELED_LOGIN.message!,
          };
          return { data: undefined, error };
        }
      }

      const service = integration.getService();

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

      const options = {
        verificationMethod: VerificationMethods.EMAIL_OTP,
        keys: wantsKeys,
        ...(service !== MozServices.Default && { service }),
        metricsContext: queryParamsToMetricsContext(
          flowQueryParams as ReturnType<typeof searchParams>
        ),
      };
      let result = await trySignIn(
        email,
        v1Credentials,
        error ? undefined : v2Credentials,
        unverifiedAccount,
        beginSignin,
        options,
        sensitiveDataClient,
        async (correctedEmail: string) => {
          return {
            v1Credentials: await getCredentials(correctedEmail, password),
            v2Credentials: error ? undefined : v2Credentials,
          };
        }
      );

      // Check recovery key status if signin was successful, user is on sync Desktop
      // and they didn't click "Do it later"; this affects navigation.
      if (
        'data' in result &&
        result.data &&
        // NOTE, Oauth desktop needs to add `service=sync` as a query parameter for this
        // to take users to the inline recovery key flow (SYNC-4408). (We may want
        // check for client ID to determine oauth desktop instead, TBD slight refactor for
        // FXA-10313).
        options.service === 'sync' &&
        config.featureFlags?.recoveryCodeSetupOnSyncSignIn === true &&
        localStorage.getItem(
          Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_DO_IT_LATER
        ) !== 'true'
      ) {
        try {
          // We must use auth-client here in case the user has 2FA or should be
          // taken to signin_token_code, else GQL responds with 'Invalid token'
          const { exists } = await authClient.recoveryKeyExists(
            result.data.signIn.sessionToken,
            email
          );
          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              recoveryKey() {
                return {
                  exists,
                };
              },
            },
          });
          result.data.showInlineRecoveryKeySetup = !exists;
        } catch (e) {
          // no-op, don't block the user from anything and just
          // skip the inline_recovery_key_setup step this time.
        }
      }

      return result;
    },
    [
      beginSignin,
      config,
      credentialStatus,
      getWrappedKeys,
      integration,
      keyStretchExp.queryParamModel,
      passwordChangeFinish,
      passwordChangeStart,
      wantsKeys,
      flowQueryParams,
      queryParamModel.hasLinkedAccount,
      authClient,
      sensitiveDataClient,
    ]
  );

  const cachedSigninHandler: CachedSigninHandler = useCallback(
    async (sessionToken: hexstring) => {
      try {
        // might need scope `profile:amr` for OAuth
        const {
          authenticationMethods,
        }: { authenticationMethods: AuthenticationMethods[] } =
          await authClient.accountProfile(sessionToken);

        const totpIsActive = authenticationMethods.includes(
          AuthenticationMethods.OTP
        );
        if (totpIsActive) {
          // Cache this for subsequent requests
          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              totp() {
                return { exists: true, verified: true };
              },
            },
          });
        }

        // after accountProfile data is retrieved we must check verified status
        // TODO: FXA-9177 can we use the useSession hook here? Or update Apollo Cache
        const {
          verified,
          sessionVerified,
          emailVerified,
        }: RecoveryEmailStatusResponse = await authClient.recoveryEmailStatus(
          sessionToken
        );

        const verificationMethod = totpIsActive
          ? VerificationMethods.TOTP_2FA
          : VerificationMethods.EMAIL_OTP;

        const verificationReason = emailVerified
          ? VerificationReasons.SIGN_IN
          : VerificationReasons.SIGN_UP;

        if (!verified) {
          await session.sendVerificationCode();
        }

        return {
          data: {
            verificationMethod,
            verificationReason,
            verified,
            // Because the cached signin was a success, we know 'uid' exists
            uid: uid!,
            sessionVerified, // might not need
            emailVerified, // might not need
          },
        };
      } catch (error) {
        // If 'invalid token' is received from profile server, it means
        // the session token has expired
        const { errno } = error as AuthUiError;
        if (errno === AuthUiErrors.INVALID_TOKEN.errno) {
          discardSessionToken();
          return { error: AuthUiErrors.SESSION_EXPIRED };
        }
        return { error };
      }
    },
    [authClient, session, uid]
  );

  const sendUnblockEmailHandler = useCallback(
    async (email: string) => {
      try {
        await authClient.sendUnblockCode(email, {
          metricsContext: queryParamsToMetricsContext(
            flowQueryParams as unknown as ReturnType<typeof searchParams>
          ),
        });
        return { success: true };
      } catch (error) {
        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        return { localizedErrorMessage };
      }
    },
    [authClient, flowQueryParams, ftlMsgResolver]
  );

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  // TODO: if validationError is 'email', in content-server we show "Bad request email param"
  // For now, just redirect to index-first, until FXA-8289 is done
  if (!email || validationError) {
    hardNavigate(`/${location.search}`);
    return <LoadingSpinner fullScreen />;
  }

  // Wait for async call (if needed) to complete
  if (hasLinkedAccount === undefined || hasPassword === undefined) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Signin
      {...{
        integration,
        serviceName,
        email,
        beginSigninHandler,
        cachedSigninHandler,
        sendUnblockEmailHandler,
        sessionToken,
        hasLinkedAccount,
        hasPassword,
        avatarData,
        avatarLoading,
        localizedErrorFromLocationState,
        finishOAuthFlowHandler,
        bannerSuccessMessage,
      }}
    />
  );
};

/**
 * Attempts to automatically upgrade user keys to v2 keys on sign in.
 */
export async function tryKeyStretchingUpgrade(
  email: string,
  password: string,
  v2Enabled: boolean,
  credentialStatus: MutationFunction<CredentialStatusResponse>,
  passwordChangeStart: MutationFunction<PasswordChangeStartResponse>,
  getWrappedKeys: MutationFunction<GetAccountKeysResponse>,
  passwordChangeFinish: MutationFunction<PasswordChangeFinishResponse>
): Promise<{
  error: any | undefined;
  unverifiedAccount: boolean;
  v1Credentials: {
    authPW: string;
    unwrapBKey: string;
  };
  v2Credentials:
    | {
        authPW: string;
        unwrapBKey: string;
      }
    | undefined;
}> {
  const v1Credentials = await getCredentials(email, password);
  let v2Credentials = undefined;
  let unverifiedAccount = false;

  if (v2Enabled) {
    let credentialStatusData: FetchResult<CredentialStatusResponse>;
    try {
      credentialStatusData = await credentialStatus({
        variables: {
          input: email,
        },
      });
    } catch (error) {
      Sentry.captureMessage(
        'Failure to finish v2 upgrade. Could not fetch credential status.'
      );
      return {
        ...getHandledError(error),
        unverifiedAccount,
        v1Credentials,
        v2Credentials,
      };
    }

    // We might have to upgrade the credentials in place.
    if (credentialStatusData.data?.credentialStatus.upgradeNeeded) {
      // Start password change.
      let keyFetchToken = '';
      let passwordChangeToken = '';
      try {
        const passwordChangeStartResponse = await passwordChangeStart({
          variables: {
            input: {
              email,
              oldAuthPW: v1Credentials.authPW,
            },
          },
        });

        const data = passwordChangeStartResponse.data?.passwordChangeStart;
        keyFetchToken = data?.keyFetchToken || '';
        passwordChangeToken = data?.passwordChangeToken || '';
      } catch (error) {
        // If the user enters the wrong password, they will see an invalid password error.
        // Otherwise something has going wrong and we should show a general error.
        Sentry.captureMessage(
          'Failure to finish v2 upgrade. Could not start password change.'
        );
        return {
          ...getHandledError(error),
          unverifiedAccount,
          v1Credentials,
          v2Credentials,
        };
      }

      // Determine wrapKb.
      let wrapKb = '';
      if (keyFetchToken) {
        try {
          const keysResponse = await getWrappedKeys({
            variables: {
              input: keyFetchToken,
            },
          });
          wrapKb = keysResponse.data?.wrappedAccountKeys.wrapKB || '';
        } catch (error) {
          const uiError = getHandledError(error);
          if (uiError.error.errno === 104) {
            // NOOP - If the account is simply 'unverified', then go through normal flow.
            // The password upgrade can occur later.
            unverifiedAccount = true;
          } else {
            Sentry.captureMessage(
              'Failure to finish v2 upgrade. Could not get wrapped keys.'
            );
            return {
              ...getHandledError(error),
              unverifiedAccount,
              v1Credentials,
              v2Credentials,
            };
          }
        }
      }

      // Derive V2 wrapKb and authPW and finalize password reset
      if (wrapKb && passwordChangeToken) {
        try {
          v2Credentials = await getCredentialsV2({
            password,
            clientSalt:
              credentialStatusData.data?.credentialStatus.clientSalt ||
              createSaltV2(),
          });

          const kB = unwrapKB(wrapKb, v1Credentials.unwrapBKey);
          const keys = await getKeysV2({
            kB,
            v1: v1Credentials,
            v2: v2Credentials,
          });

          // Will always return an empty payload on success, because no session token is provided.
          await passwordChangeFinish({
            variables: {
              input: {
                passwordChangeToken: passwordChangeToken,
                authPW: v1Credentials.authPW,
                wrapKb: keys.wrapKb,
                authPWVersion2: v2Credentials.authPW,
                wrapKbVersion2: keys.wrapKbVersion2,
                clientSalt: v2Credentials.clientSalt,
              },
            },
          });
        } catch (error) {
          Sentry.captureMessage(
            'Failure to finish v2 upgrade. Could not finish password change.'
          );
          return {
            ...getHandledError(error),
            unverifiedAccount,
            v1Credentials,
            v2Credentials,
          };
        }
      }
    } else if (credentialStatusData.data?.credentialStatus.clientSalt) {
      v2Credentials = await getCredentialsV2({
        password,
        clientSalt: credentialStatusData.data?.credentialStatus.clientSalt,
      });
    }
  }

  return {
    unverifiedAccount,
    v1Credentials,
    v2Credentials,
    error: undefined,
  };
}

/**
 * Attempts to sign in with v2Credentials if available else fallback to v1credentials for sign in.
 **/
export async function trySignIn(
  email: string,
  v1Credentials: { authPW: string; unwrapBKey: string },
  v2Credentials: { authPW: string; unwrapBKey: string } | undefined,
  unverifiedAccount: boolean,
  beginSignin: MutationFunction<BeginSigninResponse>,
  options: {
    verificationMethod: VerificationMethods;
    keys: boolean;
    metricsContext: MetricsContext;
    service?: any;
    unblockCode?: string;
    originalLoginEmail?: string;
  },
  sensitiveDataClient: SensitiveDataClient,
  onRetryCorrectedEmail?: (correctedEmail: string) => Promise<{
    v1Credentials: { authPW: string; unwrapBKey: string };
    v2Credentials: { authPW: string; unwrapBKey: string } | undefined;
  }>
) {
  try {
    const authPW =
      v2Credentials && !unverifiedAccount
        ? v2Credentials.authPW
        : v1Credentials.authPW;
    const { data } = await beginSignin({
      variables: {
        input: {
          email,
          authPW,
          options,
        },
      },
    });

    if (data) {
      const unwrapBKey =
        v2Credentials && !unverifiedAccount
          ? v2Credentials.unwrapBKey
          : v1Credentials.unwrapBKey;

      // Store for inline recovery key flow
      sensitiveDataClient.setData(AUTH_DATA_KEY, {
        authPW,
        // Store this in case the email was corrected
        emailForAuth: email,
      });

      return {
        data: {
          ...data,
          ...(options.keys && {
            unwrapBKey,
          }),
        },
      };
    }
    return { data: undefined };
  } catch (error) {
    const result = getHandledError(error);

    // Special case for incorrect email error.
    if (
      onRetryCorrectedEmail &&
      'error' in result &&
      result.error.errno === AuthUiErrors.INCORRECT_EMAIL_CASE.errno &&
      'email' in result.error &&
      result.error.email != null &&
      result.error.email !== email
    ) {
      const { v1Credentials, v2Credentials } = await onRetryCorrectedEmail(
        result.error.email
      );
      // Try one more time with the corrected email
      return trySignIn(
        result.error.email,
        v1Credentials,
        v2Credentials,
        unverifiedAccount,
        beginSignin,
        {
          ...options,
          originalLoginEmail: email,
        },
        sensitiveDataClient
      );
    }

    return result;
  }
}

export default SigninContainer;
