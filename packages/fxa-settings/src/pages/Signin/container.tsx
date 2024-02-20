/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import Signin from '.';
import {
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  useAuthClient,
} from '../../models';
import { MozServices } from '../../lib/types';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { SigninQueryParams } from '../../models/pages/signin';
import { useCallback, useEffect, useState } from 'react';
import firefox from '../../lib/channels/firefox';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { cache, currentAccount, discardSessionToken } from '../../lib/cache';
import { useMutation, useQuery } from '@apollo/client';
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
  BeginSigninResultError,
  CachedSigninHandler,
  LocationState,
  SigninContainerIntegration,
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
import { GraphQLError } from 'graphql';
import {
  AuthUiErrorNos,
  AuthUiErrors,
  composeAuthUiErrorTranslationId,
} from '../../lib/auth-errors/auth-errors';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import AuthenticationMethods from '../../constants/authentication-methods';
import { KeyStretchExperiment } from '../../models/experiments';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';
import * as Sentry from '@sentry/browser';

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

const SigninContainer = ({
  integration,
  serviceName,
}: {
  integration: SigninContainerIntegration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };
  const { queryParamModel, validationError } =
    useValidatedQueryParams(SigninQueryParams);
  const keyStretchExp = useValidatedQueryParams(KeyStretchExperiment);

  // email with either come from React signup (router state),
  // Backbone index (query param), or will be cached (local storage)
  const {
    email: emailFromLocationState,
    hasLinkedAccount: hasLinkedAccountFromLocationState,
    hasPassword: hasPasswordFromLocationState,
  } = location.state || {};

  const [accountStatus, setAccountStatus] = useState({
    hasLinkedAccount:
      queryParamModel.hasLinkedAccount || hasLinkedAccountFromLocationState,
    hasPassword: queryParamModel.hasPassword || hasPasswordFromLocationState,
  });
  const { hasLinkedAccount, hasPassword } = accountStatus;

  const nonCachedEmail = queryParamModel.email || emailFromLocationState;
  let email = nonCachedEmail;
  let sessionToken: hexstring | undefined;
  // only read from local storage if email isn't provided via query param or router state
  if (!nonCachedEmail) {
    const storedLocalAccount = currentAccount();
    email = storedLocalAccount?.email;
    sessionToken = storedLocalAccount?.sessionToken;
  }

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
          // TODO: error handling for this (and in SignUp)
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
            setAccountStatus({
              hasLinkedAccount,
              hasPassword,
            });
            if (isSyncWebChannel) {
              firefox.fxaCanLinkAccount({ email: queryParamModel.email });
            }
          }
        } else if (isSyncWebChannel) {
          // TODO: Probably move this to the Index page onsubmit once
          // the index page is converted to React, we need to run it in
          // signup and signin for Sync
          firefox.fxaCanLinkAccount({ email: queryParamModel.email });
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
      // TODO in oauth ticket
      // const service = integration.getService();
      const options = {
        verificationMethod: VerificationMethods.EMAIL_OTP,
      };

      function handleGqlError(error: any) {
        // Show invalid password error
        const graphQLError: GraphQLError = error.graphQLErrors?.[0];
        if (graphQLError && graphQLError.extensions?.errno) {
          const { errno, verificationReason, verificationMethod } =
            graphQLError.extensions as BeginSigninResultError & {
              [key: string]: any;
            };
          return {
            error: {
              errno,
              verificationReason,
              verificationMethod,
              message: AuthUiErrorNos[errno].message,
              ftlId: composeAuthUiErrorTranslationId({ errno }),
            },
          };
        } else {
          const { errno = 999, message } = AuthUiErrors.UNEXPECTED_ERROR;
          return {
            data: null,
            error: {
              errno,
              message,
              ftlId: composeAuthUiErrorTranslationId({ errno }),
            },
          };
        }
      }

      const v1Credentials = await getCredentials(email, password);
      let v2Credentials = null;

      if (keyStretchExp.queryParamModel.isV2()) {
        const credentialStatusData = await credentialStatus({
          variables: {
            input: email,
          },
        });

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
            return handleGqlError(error);
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
              const uiError = handleGqlError(error);
              if (uiError.error.errno === 104) {
                // NOOP - If the account is simply 'unverified', then go through normal flow.
                // The password upgrade can occur later.
              } else {
                return uiError;
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
              v2Credentials = null;
              return handleGqlError(error);
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
            return handleGqlError(error);
          }
        } else {
          // Something went wrong, don't fail, so user can still log in, but DO report it to sentry;
          Sentry.captureMessage(
            'Failure to finish v2 upgrade. V2 credentials are null.'
          );
        }
      }

      // TODO in oauth ticket
      //   // keys must be true to receive keyFetchToken for oAuth and syncDesktop
      //   keys: isOAuth || isSyncDesktopV3,
      //   service: service !== MozServices.Default ? service : undefined,
      // };
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
        const graphQLError: GraphQLError = error.graphQLErrors?.[0];
        if (graphQLError && graphQLError.extensions?.errno) {
          const { errno, verificationReason, verificationMethod } =
            graphQLError.extensions as BeginSigninResultError & {
              [key: string]: any;
            };
          return {
            data: null,
            error: {
              errno,
              verificationReason,
              verificationMethod,
              message: AuthUiErrorNos[errno].message,
              ftlId: composeAuthUiErrorTranslationId({ errno }),
            },
          };
        } else {
          // TODO: why is `errno` in `AuthServerError` possibly undefined?
          // might want to grab from `ERRORS.UNEXPECTED_ERROR` instead
          const { errno = 999, message } = AuthUiErrors.UNEXPECTED_ERROR;
          return {
            data: null,
            error: {
              errno,
              message,
              ftlId: composeAuthUiErrorTranslationId({ errno }),
            },
          };
        }
      }
    },
    [
      beginSignin,
      credentialStatus,
      getWrappedKeys,
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
            sessionVerified, // might not need
            emailVerified, // might not need
          },
        };
      } catch (error: any) {
        // If 'invalid token' is received from profile server, it means
        // the session token has expired
        let { errno } = error;
        if (errno === AuthUiErrors.INVALID_TOKEN.errno) {
          errno = AuthUiErrors.SESSION_EXPIRED.errno;
          discardSessionToken();
        }
        return {
          data: null,
          error: {
            errno,
            ftlId: composeAuthUiErrorTranslationId(errno),
            message: AuthUiErrorNos[errno].message,
          },
        };
      }
    },
    [authClient]
  );

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
        sessionToken,
        hasLinkedAccount,
        hasPassword,
        avatarData,
        avatarLoading,
      }}
    />
  );
};

export default SigninContainer;
