/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import Signin from '.';
import {
  Integration,
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  useAuthClient,
  useFtlMsgResolver,
  useConfig,
} from '../../models';
import { MozServices } from '../../lib/types';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { SigninQueryParams } from '../../models/pages/signin';
import { useCallback, useEffect, useState } from 'react';
import firefox from '../../lib/channels/firefox';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import {
  cache,
  currentAccount,
  discardSessionToken,
  lastStoredAccount,
} from '../../lib/cache';
import { FetchResult, useMutation, useQuery } from '@apollo/client';
import {
  AVATAR_QUERY,
  BEGIN_SIGNIN_MUTATION,
  CREDENTIAL_STATUS_MUTATION,
  GET_ACCOUNT_KEYS_MUTATION,
  PASSWORD_CHANGE_FINISH_MUTATION,
  PASSWORD_CHANGE_START_MUTATION,
} from './gql';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';
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
import {
  AuthUiError,
  AuthUiErrors,
  getLocalizedErrorMessage,
} from '../../lib/auth-errors/auth-errors';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import AuthenticationMethods from '../../constants/authentication-methods';
import { KeyStretchExperiment } from '../../models/experiments';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';
import * as Sentry from '@sentry/browser';
import { handleGQLError } from './utils';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import { setCurrentAccount } from '../../lib/storage-utils';

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

function getAccountInfo(nonCachedEmail?: string) {
  let email = nonCachedEmail;
  let sessionToken: hexstring | undefined;
  let uid: hexstring | undefined;
  // only read from local storage if email isn't provided via query param or router state
  if (!nonCachedEmail) {
    const storedLocalAccount = currentAccount();
    email = storedLocalAccount?.email;
    sessionToken = storedLocalAccount?.sessionToken;
    uid = storedLocalAccount?.uid;
  }

  // If there is still not an email, try locating the last logged in account.
  if (!email) {
    const lastStoredLocalAccount = lastStoredAccount();
    if (lastStoredLocalAccount) {
      email = lastStoredLocalAccount.email;
      sessionToken = lastStoredLocalAccount.sessionToken;
      uid = lastStoredLocalAccount.uid;
      setCurrentAccount(lastStoredLocalAccount.uid);
    }
  }

  return { email, sessionToken, uid };
}

const SigninContainer = ({
  integration,
  serviceName,
}: {
  integration: Integration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const config = useConfig();
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };
  const { queryParamModel, validationError } =
    useValidatedQueryParams(SigninQueryParams);
  const keyStretchExp = useValidatedQueryParams(KeyStretchExperiment);

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  // email with either come from React signup (router state),
  // Backbone index (query param), or will be cached (local storage)
  const {
    email: emailFromLocationState,
    // TODO: in FXA-9177, remove hasLinkedAccount and hasPassword, will be retrieved from Apollo cache
    hasLinkedAccount: hasLinkedAccountFromLocationState,
    hasPassword: hasPasswordFromLocationState,
    localizedErrorMessage: localizedErrorFromLocationState,
  } = location.state || {};

  const [accountStatus, setAccountStatus] = useState({
    hasLinkedAccount:
      // TODO: in FXA-9177, retrieve hasLinkedAccount and hasPassword from Apollo cache (not state)
      queryParamModel.hasLinkedAccount || hasLinkedAccountFromLocationState,
    hasPassword: queryParamModel.hasPassword || hasPasswordFromLocationState,
  });
  const { hasLinkedAccount, hasPassword } = accountStatus;

  const { email, sessionToken, uid } = getAccountInfo(
    queryParamModel.email || emailFromLocationState
  );

  const isOAuth = isOAuthIntegration(integration);
  const isSyncOAuth = isOAuth && integration.isSync();
  const isSyncDesktopV3 = isSyncDesktopV3Integration(integration);
  const isSyncWebChannel = isSyncOAuth || isSyncDesktopV3;

  useEffect(() => {
    (async () => {
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
              navigate(`/signup?email=${email}&emailStatusChecked=true`);
              // TODO: Probably move this to the Index page onsubmit once
              // the index page is converted to React, we need to run it in
              // signup and signin for Sync
            } else {
              // TODO: in FXA-9177, also set hasLinkedAccount and hasPassword in Apollo cache
              setAccountStatus({
                hasLinkedAccount,
                hasPassword,
              });
              if (isSyncWebChannel) {
                firefox.fxaCanLinkAccount({ email });
              }
            }
          } catch (error) {
            hardNavigateToContentServer(`/?prefillEmail=${email}`);
          }
        } else if (isSyncWebChannel) {
          // TODO: Probably move this to the Index page onsubmit once
          // the index page is converted to React, we need to run it in
          // signup and signin for Sync
          firefox.fxaCanLinkAccount({ email });
        }
      }
    })();
  });

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
      const service = integration.getService();
      const options = {
        verificationMethod: VerificationMethods.EMAIL_OTP,
        keys: integration.wantsKeys(),
        ...(service !== MozServices.Default && { service }),
      };

      const v1Credentials = await getCredentials(email, password);
      let v2Credentials = null;
      let unverifiedAccount = false;

      if (keyStretchExp.queryParamModel.isV2(config)) {
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
          return handleGQLError(error);
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
            // Other wise something has going wrong and we should show an general error.
            Sentry.captureMessage(
              'Failure to finish v2 upgrade. Could not start password change.'
            );
            return handleGQLError(error);
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
              const uiError = handleGQLError(error);
              if (uiError.error.errno === 104) {
                // NOOP - If the account is simply 'unverified', then go through normal flow.
                // The password upgrade can occur later.
                unverifiedAccount = true;
              } else {
                Sentry.captureMessage(
                  'Failure to finish v2 upgrade. Could not get wrapped keys.'
                );
                return handleGQLError(error);
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
                  (await createSaltV2()),
              });

              const kB = await unwrapKB(wrapKb, v1Credentials.unwrapBKey);
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
              return handleGQLError(error);
            }
          }
        } else if (credentialStatusData.data?.credentialStatus.clientSalt) {
          v2Credentials = await getCredentialsV2({
            password,
            clientSalt: credentialStatusData.data?.credentialStatus.clientSalt,
          });
        }

        // If we successfully created V2 credentials, finish by signing in with these.
        // Otherwise, fallback to v1 and log an error about it.
        if (v2Credentials) {
          try {
            const { data } = await beginSignin({
              variables: {
                input: {
                  email,
                  authPW: v2Credentials.authPW,
                  options,
                },
              },
            });

            return { data };
          } catch (error) {
            return handleGQLError(error);
          }
        } else if (unverifiedAccount === false) {
          // Something went wrong, don't fail, so user can still log in, but DO report it to sentry;
          Sentry.captureMessage(
            'Failure to finish v2 upgrade. V2 credentials are null.'
          );
        }
      }

      try {
        const { authPW } = await getCredentials(email, password);
        const { data } = await beginSignin({
          variables: {
            input: {
              email,
              authPW,
              options,
            },
          },
        });
        return { data };
      } catch (error) {
        // TODO consider additional error handling - any non-gql errors will return an unexpected error
        return handleGQLError(error);
      }
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
          // Cache this for /signin_token_code and /settings
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
    [authClient, uid]
  );

  const sendUnblockEmailHandler = useCallback(
    async (email: string) => {
      try {
        await authClient.sendUnblockCode(email);
        return { success: true };
      } catch (error) {
        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        return { localizedErrorMessage };
      }
    },
    [authClient, ftlMsgResolver]
  );
  // TODO: UX for this, FXA-8106
  if (oAuthDataError) {
    return (
      <AppLayout>
        <CardHeader
          headingText="Unexpected error"
          headingTextFtlId="auth-error-999"
        />
      </AppLayout>
    );
  }

  // TODO: if validationError is 'email', in content-server we show "Bad request email param"
  // For now, just redirect to index-first, until FXA-8289 is done
  if (!email || validationError) {
    hardNavigateToContentServer('/');
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
      }}
    />
  );
};

export default SigninContainer;
