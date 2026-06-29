/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useNavigate, useLocation } from 'react-router';
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
    supportsKeysOptionalLogin,
  },
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
  useFxAStatusResult: UseFxAStatusResult;
}) => {
  const navigateWithQuery = useNavigateWithQuery();
  const navigate = useNavigate();
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
  // For the passkey flow, tag the reason with the originating surface (e.g.
  // `signin_passkey`) so this shared page's funnel can be split per surface.
  const gleanReason =
    passwordCreationReason === 'passkey'
      ? `${passkeySurface ?? 'emailfirst'}_passkey`
      : passwordCreationReason;
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
        { primary: email },
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
          const emails = await authClient.accountEmails(sessionToken);
          const { authPW, unwrapBKey } = await authClient.createPassword(
            sessionToken,
            // TODO: This could be a nasty bug. The serverside code assumes that
            //       authPW is salted with the original email for the account...
            //       but in this case weren't actually checking or ensuring
            //       the email provided was the original email. Therefore we could
            //       have been setting passwords that were NOT hashed with the original
            //       account email.
            { original: emails.original },
            newPassword
          );

          const keyFetchToken = await getKeyFetchToken(
            authPW,
            email,
            sessionToken
          );
          persistAccount({ uid, hasPassword: true });

          GleanMetrics.postVerifySetPassword.success({
            event: { reason: gleanReason },
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
            navigate,
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
            authClient,
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
      navigate,
      passwordCreationReason,
      passkeySurface,
      gleanReason,
      offeredSyncEngines,
      location.search,
    ]
  );

  // Users must be already authenticated on this page.
  // This page only applies applies to flows where a passwordless account must
  // set a password for key derivation, including non-Sync Firefox flows that
  // that require keys because the browser hasn't decoupled Sync (desktop before
  // Fx 147, and Mobile presently as of Fx 153).
  if (
    !email ||
    !sessionToken ||
    !uid ||
    !integration.requiresPasswordForLogin(supportsKeysOptionalLogin)
  ) {
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
        gleanReason,
      }}
    />
  );
};

export default SetPasswordContainer;
