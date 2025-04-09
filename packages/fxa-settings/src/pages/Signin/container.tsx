/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../lib/hooks/useNavigateWithQuery';
import Signin from '.';
import {
  Integration,
  useAuthClient,
  useFtlMsgResolver,
  useConfig,
  useSession,
  useSensitiveDataClient,
  isOAuthIntegration,
  isOAuthNativeIntegrationSync,
} from '../../models';
import { MozServices } from '../../lib/types';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import {
  SigninQueryParams,
  OAuthNativeSyncQueryParameters,
  OAuthQueryParams,
} from '../../models/pages/signin';
import { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { cache, currentAccount, lastStoredAccount } from '../../lib/cache';
import { MutationFunction, useMutation, useQuery } from '@apollo/client';
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
import { getCredentials } from 'fxa-auth-client/lib/crypto';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import VerificationMethods from '../../constants/verification-methods';
import { KeyStretchExperiment } from '../../models/experiments';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { searchParams } from '../../lib/utilities';
import { QueryParams } from '../..';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import { MetricsContext } from '@fxa/shared/glean';
import { isEmailValid } from 'fxa-shared/email/helpers';
import {
  getHandledError,
  getLocalizedErrorMessage,
} from '../../lib/error-utils';
import { firefox } from '../../lib/channels/firefox';
import {
  SensitiveData,
  SensitiveDataClient,
} from '../../lib/sensitive-data-client';
import { Constants } from '../../lib/constants';
import {
  isFirefoxService,
  isUnsupportedContext,
} from '../../models/integrations/utils';
import { GqlKeyStretchUpgrade } from '../../lib/gql-key-stretch-upgrade';
import { setCurrentAccount } from '../../lib/storage-utils';
import { useCheckReactEmailFirst } from '../../lib/hooks';
import { cachedSignIn } from './utils';
import OAuthDataError from '../../components/OAuthDataError';

/*
 * In Backbone, the `email` param is optional. If it's provided, we
 * check against it to see if the account exists and if it doesn't, we redirect
 * users to `/signup`.
 *
 * In the React signin version, if the index page is still on Backbone, we're temporarily passing the
 * `email` param over from the Backbone index page. If React index, we pass the param with router state.
 *
 * If Backbone, since we already perform this account exists (account status) check on the Backbone
 * index page, which is rate limited since it doesn't require a session token, we also temporarily
 * pass email status params to 1) signal not to perform the check again but also because 2) these
 * params are needed to conditionally display UI in signin. If no status params are passed and
 * `email` is, or we read the email from local storage, we perform the check and redirect existing
 * user emails to `/signup` to match content-server functionality.
 */

function getAccountInfo(email?: string) {
  const storedLocalAccount = currentAccount() || lastStoredAccount();

  if (email) {
    // Try to use local storage values if email matches the email in local storage
    if (storedLocalAccount?.email === email) {
      return {
        email: storedLocalAccount.email,
        sessionToken: storedLocalAccount.sessionToken,
        uid: storedLocalAccount.uid,
      };
    }

    return { email };
  }

  if (storedLocalAccount) {
    setCurrentAccount(storedLocalAccount.uid);
    return {
      email: storedLocalAccount.email,
      sessionToken: storedLocalAccount.sessionToken,
      uid: storedLocalAccount.uid,
    };
  }

  return {};
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
  const shouldUseReactEmailFirst = useCheckReactEmailFirst();

  const { queryParamModel, validationError } = useValidatedQueryParams(
    SigninQueryParams,
    true
  );

  // Validates that query parameters are valid for an oauth integration
  useValidatedQueryParams(
    OAuthQueryParams,
    true,
    !isOAuthIntegration(integration)
  );

  // Validates that query parameters are valid for a sync oauth integration
  useValidatedQueryParams(
    OAuthNativeSyncQueryParameters,
    true,
    !isOAuthNativeIntegrationSync(integration)
  );

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
    successBanner,
  } = location.state || ({} as LocationState);

  const { localizedSuccessBannerHeading, localizedSuccessBannerDescription } =
    successBanner || {};

  // If hasLinkedAccount is defined from location state (React email-first), or query
  // params (Backbone email-first) then we know the user came from email-first
  const originFromEmailFirst = !!(
    hasLinkedAccountFromLocationState !== undefined ||
    queryParamModel.hasLinkedAccount
  );

  const [accountStatus, setAccountStatus] = useState({
    hasLinkedAccount:
      // TODO: in FXA-9177, retrieve hasLinkedAccount and hasPassword from Apollo cache (not state)
      hasLinkedAccountFromLocationState !== undefined
        ? hasLinkedAccountFromLocationState
        : queryParamModel.hasLinkedAccount,
    hasPassword:
      hasPasswordFromLocationState !== undefined
        ? hasPasswordFromLocationState
        : queryParamModel.hasPassword,
  });
  const { hasLinkedAccount, hasPassword } = accountStatus;

  const { email, sessionToken } = getAccountInfo(
    emailFromLocationState || queryParamModel.email
  );

  const wantsKeys = integration.wantsKeys();

  useEffect(() => {
    (async () => {
      const queryParams = new URLSearchParams(location.search);
      if (!validationError && email) {
        // if you directly hit /signin with email param, or we read from localstorage
        // (on this page or email-first) this means the account status hasn't been checked
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
              const signUpPath = location.pathname.startsWith('/oauth')
                ? '/oauth/signup'
                : '/signup';
              if (shouldUseReactEmailFirst) {
                navigate(signUpPath, {
                  state: {
                    email,
                    emailStatusChecked: true,
                  },
                });
              } else {
                queryParams.set('email', email);
                queryParams.set('emailStatusChecked', 'true');
                navigate(`${signUpPath}?${queryParams}`);
              }
            } else {
              // TODO: in FXA-9177, also set hasLinkedAccount and hasPassword in Apollo cache
              setAccountStatus({
                hasLinkedAccount,
                hasPassword,
              });
            }
          } catch (error) {
            if (shouldUseReactEmailFirst) {
              navigate('/', {
                state: {
                  prefillEmail: email,
                },
              });
            } else {
              // Passing back the 'email' param causes various behaviors in
              // content-server since it marks the email as "coming from a RP".
              queryParams.delete('email');
              queryParams.delete('showReactApp=true');
              if (isEmailValid(email)) {
                queryParams.set('prefillEmail', email);
              }
              hardNavigate(`/?${queryParams}`);
            }
          }
        }
      } else {
        if (shouldUseReactEmailFirst) {
          navigate('/', {
            state: {
              prefillEmail: email,
            },
          });
        } else {
          // Passing back the 'email' param causes various behaviors in
          // content-server since it marks the email as "coming from a RP".
          queryParams.delete('email');
          queryParams.delete('showReactApp');
          if (email && isEmailValid(email)) {
            queryParams.set('prefillEmail', email);
          }
          const optionalParams = queryParams.size > 0 ? `?${queryParams}` : '';
          hardNavigate(`/${optionalParams}`);
        }
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
      // If the user was on email-first they were already prompted with the sync merge
      // warning. The browser will automatically respond with { ok: true } without
      // prompting the user if it matches the email the browser has data for.
      if (
        (integration.isSync() || integration.isDesktopRelay()) &&
        !originFromEmailFirst
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
      const clientId = integration.getClientId();

      const v2Enabled = keyStretchExp.queryParamModel.isV2(config);

      // Create client to handle key stretching upgrades
      const upgradeClient = new GqlKeyStretchUpgrade(
        'signin',
        credentialStatus,
        getWrappedKeys,
        passwordChangeStart,
        passwordChangeFinish
      );

      // Get the current state of user credentials. This could indicate
      // the user has already upgraded, or it could indicate an upgrade
      // is needed.
      const credentials = await upgradeClient.getCredentials(
        email,
        password,
        v2Enabled
      );

      const v1Credentials = credentials.v1Credentials;
      const v2Credentials =
        credentials.credentialStatus?.currentVersion === 'v2'
          ? credentials.v2Credentials
          : undefined;

      const options = {
        verificationMethod: VerificationMethods.EMAIL_OTP,
        keys: wantsKeys,
        // See oauth_client_info in the auth-server for details on service/clientId
        // Sending up the clientId when the user is not signing in to the browser
        // is used to show the correct service name in emails
        ...(isFirefoxService(service) ? { service } : { service: clientId }),
        metricsContext: queryParamsToMetricsContext(
          flowQueryParams as ReturnType<typeof searchParams>
        ),
      };
      let result = await trySignIn(
        email,
        v1Credentials,
        v2Credentials,
        beginSignin,
        options,
        sensitiveDataClient,
        async (correctedEmail: string) => {
          return {
            v1Credentials: await getCredentials(correctedEmail, password),
            v2Credentials: v2Credentials,
          };
        }
      );

      // Check recovery key status if signin was successful, user is on sync Desktop
      // and they didn't click "Do it later"; this affects navigation.
      if (
        'data' in result &&
        result.data &&
        integration.isDesktopSync() &&
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

      // If an upgrade is needed try running it after we know whether or not
      // the session is verified. If the session is not verified, there's no
      // point in attempting the upgrade at this time.
      if (
        credentials.credentialStatus?.upgradeNeeded === true &&
        credentials.v2Credentials
      ) {
        if ('data' in result && result.data?.signIn.verified === true) {
          const sessionToken = result.data?.signIn.sessionToken;
          await upgradeClient.upgrade(
            email,
            credentials.v1Credentials,
            credentials.v2Credentials,
            sessionToken
          );
        } else {
          sensitiveDataClient.KeyStretchUpgradeData = {
            email,
            v1Credentials: credentials.v1Credentials,
            v2Credentials: credentials.v2Credentials,
          };
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
      authClient,
      sensitiveDataClient,
      originFromEmailFirst,
    ]
  );

  const cachedSigninHandler: CachedSigninHandler = useCallback(
    async (sessionToken: hexstring) =>
      cachedSignIn(sessionToken, authClient, cache, session),
    [authClient, session]
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

  if (isUnsupportedContext(integration.data.context)) {
    hardNavigate('/update_firefox', {}, true);
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
        localizedSuccessBannerHeading,
        localizedSuccessBannerDescription,
      }}
    />
  );
};

export async function getCurrentCredentials(
  client: GqlKeyStretchUpgrade,
  email: string,
  password: string,
  v2Enabled: boolean
) {
  const {
    v1Credentials,
    v2Credentials,
    credentialStatus: ksStatus,
  } = await client.getCredentials(email, password, v2Enabled);

  return {
    ksStatus,
    v1Credentials,
    v2Credentials,
  };
}

/**
 * Attempts to sign in with v2Credentials if available else fallback to v1credentials for sign in.
 **/
export async function trySignIn(
  email: string,
  v1Credentials: { authPW: string; unwrapBKey: string },
  v2Credentials: { authPW: string; unwrapBKey: string } | undefined,
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
    v2Credentials:
      | { authPW: string; unwrapBKey: string; clientSalt: string }
      | undefined;
  }>
) {
  try {
    const authPW = v2Credentials?.authPW || v1Credentials.authPW;
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
      const unwrapBKey = v2Credentials
        ? v2Credentials.unwrapBKey
        : v1Credentials.unwrapBKey;

      sensitiveDataClient.setDataType(SensitiveData.Key.Auth, {
        // Store for inline recovery key flow
        authPW,
        // Store this in case the email was corrected
        emailForAuth: email,
        unwrapBKey,
        keyFetchToken: data.signIn.keyFetchToken,
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
      return await trySignIn(
        result.error.email,
        v1Credentials,
        v2Credentials,
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
