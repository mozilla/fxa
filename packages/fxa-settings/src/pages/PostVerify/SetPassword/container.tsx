/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import SetPassword from '.';
import { currentAccount } from '../../../lib/cache';
import { persistAccount } from '../../../lib/storage-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { Integration, useAuthClient } from '../../../models';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CreatePasswordHandler, SetPasswordLocationState } from './interfaces';
import { HandledError } from '../../../lib/error-utils';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import OAuthDataError from '../../../components/OAuthDataError';
import { NavigationOptions } from '../../Signin/interfaces';
import { handleNavigation } from '../../Signin/utils';
import { buildPasskeyAuthSuccessReason } from '../../../lib/passkeys/signin-flow';
import GleanMetrics from '../../../lib/glean';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import type { UseFxAStatusResult } from '../../../lib/hooks/useFxAStatus';
import AppLayout from '../../../components/AppLayout';

const SetPasswordContainer = ({
  integration,
  flowQueryParams,
  useFxAStatusResult: {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    selectedEnginesForGlean,
  },
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
  useFxAStatusResult: UseFxAStatusResult;
} & RouteComponentProps) => {
  const navigateWithQuery = useNavigateWithQuery();
  const authClient = useAuthClient();
  const storedLocalAccount = currentAccount();
  const email = storedLocalAccount?.email;
  const sessionToken = storedLocalAccount?.sessionToken;
  const uid = storedLocalAccount?.uid;

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SetPasswordLocationState;
  };
  // All known navigation paths set this explicitly (`getSyncNavigate` for
  // third-party-auth, `SigninPasswordlessCode` for OTP, `signin-flow` for
  // passkey). The default is a safety net for direct URL hits or page
  // refreshes that drop router state.
  //
  // Known metric attribution bias: a refresh while on this page after an
  // OTP or passkey flow will tag the success event as `third_party_auth`
  // since router state is gone. Third-party-auth is the highest-volume
  // path through this page, so the default biases toward the historically
  // dominant flow. Refresh on this page is rare in practice.
  const passwordCreationReason =
    location.state?.passwordCreationReason ?? 'third_party_auth';
  const passkeySurface = location.state?.passkeySurface;
  const metricsContext = queryParamsToMetricsContext(
    flowQueryParams as unknown as Record<string, string>
  );

  // Trust the stored password state; fall back to a one-time accountStatus
  // check only when it's unknown (e.g. third-party sign-in, stale/direct hit).
  const knownHasPassword = storedLocalAccount?.hasPassword;
  const passwordStateKnown = knownHasPassword !== undefined;

  const [passwordStatus, setPasswordStatus] = useState<{
    isLoading: boolean;
    hasPassword: boolean;
  }>({
    isLoading: !passwordStateKnown,
    hasPassword: knownHasPassword ?? false,
  });
  const didCheckRef = useRef(false);
  useEffect(() => {
    if (passwordStateKnown || !sessionToken || didCheckRef.current) return;
    didCheckRef.current = true;
    authClient
      .accountStatus(undefined, sessionToken)
      .then((status) =>
        setPasswordStatus({
          isLoading: false,
          hasPassword: !!status.hasPassword,
        })
      )
      // On failure, treat as no password; the server rejects if one exists.
      .catch(() => setPasswordStatus({ isLoading: false, hasPassword: false }));
  }, [authClient, sessionToken, passwordStateKnown]);

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const getKeyFetchToken = useCallback(
    async (authPW: string, email: string, sessionToken: string) => {
      // We must reauth for another `keyFetchToken` because it was used in
      // the oauth flow
      const { keyFetchToken } = await authClient.sessionReauthWithAuthPW(
        sessionToken,
        email,
        authPW,
        {
          keys: true,
          reason: 'signin',
          metricsContext,
        }
      );
      return keyFetchToken;
    },
    [authClient, metricsContext]
  );

  const createPassword = useCallback(
    (uid: string, email: string, sessionToken: string): CreatePasswordHandler =>
      async (newPassword: string) => {
        try {
          const { authPW, unwrapBKey } = await authClient.createPassword(
            sessionToken,
            email,
            newPassword
          );

          const keyFetchToken = await getKeyFetchToken(
            authPW,
            email,
            sessionToken
          );
          persistAccount({ uid, hasPassword: true });

          GleanMetrics.postVerifySetPassword.success({
            event: { reason: passwordCreationReason },
          });

          // For passkey flow, fire the consolidated terminal-success event
          // so Looker funnels can attribute this end-state directly without
          // joining across the per-surface ceremony event and this one.
          // `passkeySurface` is set by signin-flow.ts when it routes here;
          // defaults to 'emailfirst' for refresh / direct-URL hits.
          if (passwordCreationReason === 'passkey') {
            GleanMetrics.passkey.authSuccess({
              event: {
                reason: buildPasskeyAuthSuccessReason(
                  passkeySurface ?? 'emailfirst',
                  'createdpassword'
                ),
              },
            });
          }

          const navigationOptions: NavigationOptions = {
            email,
            signinData: {
              uid,
              sessionToken,
              emailVerified: true,
              sessionVerified: true,
              keyFetchToken,
            },
            unwrapBKey,
            integration,
            finishOAuthFlowHandler,
            queryParams: location.search,
            handleFxaLogin: true,
            handleFxaOAuthLogin: true,
            showSignupConfirmedSync: true,
            origin: 'post-verify-set-password',
            syncEngines: {
              offeredEngines: offeredSyncEngines,
              declinedEngines: declinedSyncEngines,
            },
            // Don't navigate mobile users. The client controls the web view and
            // users will see a "flash" of whatever page we navigate them to
            // before the client closes the view. See FXA-11944
            performNavigation: !integration.isFirefoxMobileClient(),
            authClient
          };

          const { error } = await handleNavigation(navigationOptions);
          return { error };
        } catch (error) {
          const { errno } = error as HandledError;
          if (errno && AuthUiErrorNos[errno]) {
            return { error };
          }
          return { error: AuthUiErrors.UNEXPECTED_ERROR as HandledError };
        }
      },
    [
      authClient,
      declinedSyncEngines,
      integration,
      finishOAuthFlowHandler,
      getKeyFetchToken,
      passwordCreationReason,
      passkeySurface,
      offeredSyncEngines,
      location.search,
    ]
  );

  // Users must be already authenticated on this page.
  // This page is currently always for the Sync flow.
  if (!email || !sessionToken || !uid || !integration.isSync()) {
    navigateWithQuery('/signin', { replace: true });
    return <AppLayout cmsInfo={integration.getCmsInfo()} loading />;
  }
  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  // Don't render SetPassword until this check is finished, otherwise
  // some users might see a flash of that page before redirecting.
  if (passwordStatus.isLoading) {
    return <AppLayout cmsInfo={integration.getCmsInfo()} loading />;
  }

  // Already has a password (re-entry): sign in instead.
  if (passwordStatus.hasPassword) {
    navigateWithQuery('/signin', { replace: true });
    return <AppLayout cmsInfo={integration.getCmsInfo()} loading />;
  }

  // Curry already checked values
  const createPasswordHandler = createPassword(uid, email, sessionToken);

  return (
    <SetPassword
      {...{
        email,
        createPasswordHandler,
        offeredSyncEngineConfigs,
        integration,
        passwordCreationReason,
      }}
    />
  );
};

export default SetPasswordContainer;
