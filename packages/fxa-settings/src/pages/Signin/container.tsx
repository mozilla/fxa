/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
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
  isOAuthNativeIntegration,
} from '../../models';
import { UseFxAStatusResult } from '../../lib/hooks/useFxAStatus';
import { MozServices } from '../../lib/types';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import {
  SigninQueryParams,
  OAuthNativeSyncQueryParameters,
  OAuthQueryParams,
} from '../../models/pages/signin';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  currentAccount,
  lastStoredAccount,
  findAccountByEmail,
  discardSessionToken,
} from '../../lib/cache';
import { hardNavigate } from 'fxa-react/lib/utils';
import {
  BeginSigninHandler,
  BeginSigninResponse,
  CachedSigninHandler,
  LocationState,
} from './interfaces';
import { getCredentials } from 'fxa-auth-client/lib/crypto';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { KeyStretchExperiment } from '../../models/experiments';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { searchParams } from '../../lib/utilities';
import { QueryParams } from '../..';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import { MetricsContext } from '@fxa/shared/glean';
import {
  getHandledError,
  getLocalizedErrorMessage,
} from '../../lib/error-utils';
import {
  SensitiveData,
  SensitiveDataClient,
} from '../../lib/sensitive-data-client';
import { Constants } from '../../lib/constants';
import {
  isFirefoxService,
  isUnsupportedContext,
} from '../../models/integrations/utils';
import { AuthKeyStretchUpgrade } from '../../lib/auth-key-stretch-upgrade';
import {
  setCurrentAccount,
  storeAccountData,
  StoredAccountData,
} from '../../lib/storage-utils';
import { cachedSignIn, ensureCanLinkAcountOrRedirect } from './utils';
import OAuthDataError from '../../components/OAuthDataError';
import { AppLayout } from '../../components/AppLayout';

/** OAuth token TTL in seconds for profile server requests */
const PROFILE_OAUTH_TOKEN_TTL_SECONDS = 300;

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

function getAccountInfo(email?: string): {
  email?: string;
  sessionToken?: string;
  uid?: string;
} {
  const apply = (targetAccount: StoredAccountData) => {
    return {
      email: targetAccount.email,
      sessionToken: targetAccount.sessionToken,
      uid: targetAccount.uid,
    };
  };
  let targetAccount = undefined;

  // If an email is directly provided, use it! Try to find the matching
  // account in local storage and proceed with the account.
  if (email) {
    targetAccount = findAccountByEmail(email);
    if (targetAccount) {
      return apply(targetAccount);
    } else {
      return { email };
    }
  }

  // If an email was not provided, then make a best effort to resolve
  // an account from local storage. Default to the currentAccount if available.
  // If not current account, then fallback to the last stored account.
  targetAccount = currentAccount();
  if (targetAccount) {
    return apply(targetAccount);
  }

  // We still haven't found an account, so see if one was recently used. If so
  // pick that.
  targetAccount = lastStoredAccount();
  if (targetAccount) {
    return apply(targetAccount);
  }

  // Nothing found! Return empty account.
  return {};
}

const SigninContainer = ({
  integration,
  serviceName,
  flowQueryParams,
  useFxAStatusResult,
  setCurrentSplitLayout,
}: {
  integration: Integration;
  serviceName: MozServices;
  flowQueryParams?: QueryParams;
  useFxAStatusResult: UseFxAStatusResult;
  setCurrentSplitLayout?: (value: boolean) => void;
} & RouteComponentProps) => {
  const config = useConfig();
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };
  const session = useSession();
  const sensitiveDataClient = useSensitiveDataClient();

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
    // TODO: in FXA-9177, consider storing hasLinkedAccount and hasPassword in localStorage
    hasLinkedAccount: hasLinkedAccountFromLocationState,
    hasPassword: hasPasswordFromLocationState,
    canLinkAccountOk,
    localizedErrorMessage: localizedErrorFromLocationState,
    successBanner,
  } = location.state || ({} as LocationState);

  const { localizedSuccessBannerHeading, localizedSuccessBannerDescription } =
    successBanner || {};

  const [accountStatus, setAccountStatus] = useState({
    hasLinkedAccount:
      // TODO: in FXA-9177, consider retrieving hasLinkedAccount and hasPassword from localStorage
      hasLinkedAccountFromLocationState !== undefined
        ? hasLinkedAccountFromLocationState
        : queryParamModel.hasLinkedAccount,
    hasPassword:
      hasPasswordFromLocationState !== undefined
        ? hasPasswordFromLocationState
        : queryParamModel.hasPassword,
  });
  const { hasLinkedAccount, hasPassword } = accountStatus;

  const { email, sessionToken, uid } = getAccountInfo(
    emailFromLocationState || queryParamModel.email
  );

  // Handle setCurrentAccount side effect after render to avoid updating parent during child render
  useEffect(() => {
    if (uid) {
      setCurrentAccount(uid);
    } else if (email && !uid) {
      // Email provided but no matching account in storage
      setCurrentAccount('');
    }
  }, [uid, email]);

  const wantsKeys = integration.wantsKeys();

  useEffect(() => {
    (async () => {
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

              navigateWithQuery(signUpPath, {
                state: {
                  email,
                  emailStatusChecked: true,
                },
              });
            } else {
              // TODO: in FXA-9177, consider persisting hasLinkedAccount and hasPassword to localStorage
              setAccountStatus({
                hasLinkedAccount,
                hasPassword,
              });
            }
          } catch (error) {
            navigateWithQuery('/', {
              state: {
                prefillEmail: email,
              },
            });
          }
        }
      } else {
        navigateWithQuery('/', {
          state: {
            prefillEmail: email,
          },
        });
      }
    })();
    // Only run this on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Avatar state - fetched directly from profile server
  const [avatarData, setAvatarData] = useState<
    { account: { avatar: { id: string; url: string } } } | undefined
  >(undefined);
  const [avatarLoading, setAvatarLoading] = useState(true);

  // Fetch avatar on mount from profile server (requires OAuth token)
  useEffect(() => {
    if (
      sessionToken &&
      config?.servers?.profile?.url &&
      config?.oauth?.clientId
    ) {
      // Get OAuth token with profile:avatar scope (required by profile server)
      authClient
        .createOAuthToken(sessionToken, config.oauth.clientId, {
          scope: 'profile:avatar',
          ttl: PROFILE_OAUTH_TOKEN_TTL_SECONDS,
        })
        .then(({ access_token }) => {
          return fetch(`${config.servers.profile.url}/v1/avatar`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          });
        })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch avatar');
          return response.json();
        })
        .then((data: { id: string; url: string; avatar?: string }) => {
          setAvatarData({
            account: {
              avatar: {
                id: data.id,
                url: data.avatar || data.url,
              },
            },
          });
        })
        .catch(() => {
          // Avatar fetch failed, use default
          setAvatarData(undefined);
        })
        .finally(() => {
          setAvatarLoading(false);
        });
    } else {
      setAvatarLoading(false);
    }
  }, [authClient, config, sessionToken]);

  // For Firefox non-Sync flows, validate the cached session token before rendering.
  // This is because if users "sign out" from the browser menu, FxA doesn't know
  // about it (and can't, because even with a web channel message, FxA would need
  // to be pulled up in a tab) and Fx non-Sync flows will see cached sign-in.
  // This provides those users with slightly less friction since they'd see an error
  // message and then be asked to enter their password. If the session token is
  // invalid, we discard it so the user sees the password field right away.
  const needsSessionValidation =
    integration.isFirefoxNonSync() && !!sessionToken;
  const [sessionValidationComplete, setSessionValidationComplete] = useState(
    !needsSessionValidation
  );

  const hasValidated = useRef(false);
  useEffect(() => {
    // This ensures the useEffect is only ran once
    if (hasValidated.current) return;
    hasValidated.current = true;

    if (!needsSessionValidation) {
      setSessionValidationComplete(true);
      return;
    }

    (async () => {
      const isValid = await session.isValid(sessionToken!);
      if (!isValid) {
        discardSessionToken();
      }
      setSessionValidationComplete(true);
    })();
  }, [needsSessionValidation, session, sessionToken]);

  const beginSigninHandler: BeginSigninHandler = useCallback(
    async (email: string, password: string) => {
      // - If the user came from email-first WITHOUT a linked third‑party account, Index already showed
      //   the merge prompt for old firefox versions (supportsCanLinkAccountUid=false).
      // - If the user HAS a linked third‑party account, Index deferred the prompt to avoid duplicates,
      //   so we must prompt here instead.
      // Note: the browser will repond {ok} if the email matches stored data or the user accepts the merge.
      if (
        (integration.isSync() || integration.isFirefoxNonSync()) &&
        !canLinkAccountOk &&
        !useFxAStatusResult.supportsCanLinkAccountUid
      ) {
        const ok = await ensureCanLinkAcountOrRedirect({
          email,
          ftlMsgResolver,
          navigateWithQuery,
        });
        if (!ok) {
          return { data: undefined };
        }
      }

      const service = integration.getService();
      const clientId = integration.getClientId();

      const v2Enabled = keyStretchExp.queryParamModel.isV2(config);

      // Create client to handle key stretching upgrades
      const upgradeClient = new AuthKeyStretchUpgrade('signin', authClient);

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
        authClient,
        options,
        sensitiveDataClient,
        async (correctedEmail: string) => {
          return {
            v1Credentials: await getCredentials(correctedEmail, password),
            v2Credentials: v2Credentials,
          };
        }
      );

      if ('data' in result && result.data) {
        if (
          isOAuthNativeIntegration(integration) &&
          useFxAStatusResult.supportsCanLinkAccountUid
        ) {
          const ok = await ensureCanLinkAcountOrRedirect({
            email,
            uid: result.data.signIn.uid,
            ftlMsgResolver,
            navigateWithQuery,
          });
          if (!ok) {
            return { data: undefined };
          }
        }

        // Check recovery key status if signin was successful, user is on sync Desktop
        // and they didn't click "Do it later"; this affects navigation.
        if (
          integration.isDesktopSync() &&
          config.featureFlags?.recoveryCodeSetupOnSyncSignIn === true &&
          localStorage.getItem(
            Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_DO_IT_LATER
          ) !== 'true'
        ) {
          try {
            // Check recovery key status to determine if we should show inline setup
            const { exists } = await authClient.recoveryKeyExists(
              result.data.signIn.sessionToken,
              email
            );
            result.data.showInlineRecoveryKeySetup = !exists;
          } catch (e) {
            // no-op, don't block the user from anything and just
            // skip the inline_recovery_key_setup step this time.
          }
        }

        // If an upgrade is needed try running it after we know whether or not
        // the session is verified. If the session is not verified, there's no
        // point in attempting the upgrade at this time.
        //
        // In this case, we should stash the credentials so we can try at a later
        // point in then flow after verification is complete.
        //
        const { emailVerified, sessionVerified } = result.data.signIn;
        const accountData: StoredAccountData = {
          email,
          uid: result.data.signIn.uid,
          lastLogin: Date.now(),
          sessionToken: result.data.signIn.sessionToken,
          verified: emailVerified && sessionVerified,
          sessionVerified,
          metricsEnabled: result.data.signIn.metricsEnabled,
          hasPassword: true,
        };

        storeAccountData(accountData);

        if (
          credentials.credentialStatus?.upgradeNeeded === true &&
          credentials.v2Credentials
        ) {
          let upgraded = false;
          const sessionToken = result.data.signIn.sessionToken;
          const isVerified =
            result.data.signIn.emailVerified &&
            result.data.signIn.sessionVerified;
          if (sessionToken && isVerified) {
            upgraded = await upgradeClient.upgrade(
              email,
              credentials.v1Credentials,
              credentials.v2Credentials,
              sessionToken
            );
          }

          if (upgraded) {
            sensitiveDataClient.KeyStretchUpgradeData = undefined;
          } else {
            sensitiveDataClient.KeyStretchUpgradeData = {
              email,
              v1Credentials: credentials.v1Credentials,
              v2Credentials: credentials.v2Credentials,
            };
          }
        }
      }

      return result;
    },
    [
      config,
      integration,
      keyStretchExp.queryParamModel,
      wantsKeys,
      flowQueryParams,
      authClient,
      sensitiveDataClient,
      canLinkAccountOk,
      ftlMsgResolver,
      navigateWithQuery,
      useFxAStatusResult,
    ]
  );

  const cachedSigninHandler: CachedSigninHandler = useCallback(
    async (sessionToken: hexstring) =>
      cachedSignIn(sessionToken, authClient, session),
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

  const cmsInfo = integration.getCmsInfo();
  // sessionToken is a necessary precondition for showing the cached page
  const splitLayout = sessionToken
    ? (cmsInfo?.SigninCachedPage?.splitLayout ?? cmsInfo?.SigninPage?.splitLayout)
    : cmsInfo?.SigninPage?.splitLayout;

  // TODO: if validationError is 'email', in content-server we show "Bad request email param"
  // For now, just redirect to index-first, until FXA-8289 is done
  if (!email || validationError) {
    navigateWithQuery('/');
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  // Wait for async calls (if needed) to complete
  if (
    hasLinkedAccount === undefined ||
    hasPassword === undefined ||
    !sessionValidationComplete
  ) {
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  if (isUnsupportedContext(integration.data.context)) {
    hardNavigate('/update_firefox', {}, true);
    return (
      <AppLayout {...{ loading: true, splitLayout, setCurrentSplitLayout }} />
    );
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
        flowQueryParams,
        useFxAStatusResult,
        setCurrentSplitLayout,
      }}
    />
  );
};

export async function getCurrentCredentials(
  client: AuthKeyStretchUpgrade,
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
  authClient: ReturnType<typeof useAuthClient>,
  options: {
    verificationMethod: VerificationMethods;
    keys: boolean;
    metricsContext: MetricsContext;
    service?: string;
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
    const response = await authClient.signInWithAuthPW(email, authPW, {
      verificationMethod: options.verificationMethod,
      keys: options.keys,
      service: options.service,
      metricsContext: options.metricsContext,
      unblockCode: options.unblockCode,
      originalLoginEmail: options.originalLoginEmail,
    });

    if (response) {
      const unwrapBKey = v2Credentials
        ? v2Credentials.unwrapBKey
        : v1Credentials.unwrapBKey;

      sensitiveDataClient.setDataType(SensitiveData.Key.Auth, {
        // Store for inline recovery key flow
        authPW,
        // Store this in case the email was corrected
        emailForAuth: email,
        unwrapBKey,
        keyFetchToken: response.keyFetchToken,
      });

      // Transform response to match expected BeginSigninResponse format
      const data: BeginSigninResponse = {
        signIn: {
          uid: response.uid,
          sessionToken: response.sessionToken,
          authAt: response.authAt,
          metricsEnabled: response.metricsEnabled ?? true,
          emailVerified: response.emailVerified ?? false,
          sessionVerified: response.sessionVerified ?? false,
          verificationMethod: (response.verificationMethod ||
            VerificationMethods.EMAIL_OTP) as VerificationMethods,
          verificationReason:
            response.verificationReason as VerificationReasons,
          keyFetchToken: response.keyFetchToken,
        },
        ...(options.keys && {
          unwrapBKey,
        }),
      };

      return { data };
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
        authClient,
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
