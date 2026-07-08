/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useNavigate, useLocation } from 'react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Integration,
  useAuthClient,
  useConfig,
  useFtlMsgResolver,
} from '../../../models';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { PROFILE_OAUTH_TOKEN_TTL_SECONDS } from '../../../lib/oauth';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { discardSessionToken } from '../../../lib/cache';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import { AccountAvatar } from '../../../lib/interfaces';
import OAuthDataError from '../../../components/OAuthDataError';
import AppLayout from '../../../components/AppLayout';
import VerificationMethods from '../../../constants/verification-methods';
import { getSigninState, handleNavigation } from '../utils';
import { SigninLocationState } from '../interfaces';
import { buildPasskeyAuthSuccessReason } from '../../../lib/passkeys/signin-flow';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import { QueryParams } from '../../..';
import SigninPasskeyFallback from '.';

// Password step for accounts that signed in with a passkey but still need the
// account password to unwrap Sync encryption keys.
const SigninPasskeyFallbackContainer = ({
  integration,
  flowQueryParams,
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
}) => {
  const authClient = useAuthClient();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninLocationState;
  };
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  // Falls back to cached localStorage account so the page survives refresh.
  const signinState = getSigninState(location.state);
  const [localizedErrorMessage, setLocalizedErrorMessage] = useState('');

  const sessionToken = signinState?.sessionToken;
  const email = signinState?.email;
  const uid = signinState?.uid;
  const passkeySurface = location.state?.passkeySurface ?? 'emailfirst';
  const syncPreKeysLoginSent = location.state?.syncPreKeysLoginSent ?? false;
  // 'passkey' keeps the passkey copy + Glean; 'resume' (Turn-on-Sync of a
  // keyless account) shows generic copy and skips the passkey-scoped metrics.
  const reason = location.state?.reason ?? 'passkey';
  const isPasskey = reason === 'passkey';
  const metricsContext = useMemo(
    () => queryParamsToMetricsContext(flowQueryParams),
    [flowQueryParams]
  );

  // Mirrors Signin/container.tsx's avatar fetch: mint a profile:avatar-scoped
  // OAuth token, GET /v1/avatar from the profile server, fall back to default
  // on any failure.
  const [avatarData, setAvatarData] = useState<
    { account: { avatar: AccountAvatar } } | undefined
  >(undefined);
  const [avatarLoading, setAvatarLoading] = useState(true);

  useEffect(() => {
    if (
      !sessionToken ||
      !config?.servers?.profile?.url ||
      !config?.oauth?.clientId
    ) {
      setAvatarLoading(false);
      return;
    }
    let cancelled = false;
    authClient
      .createOAuthToken(sessionToken, config.oauth.clientId, {
        scope: 'profile:avatar',
        ttl: PROFILE_OAUTH_TOKEN_TTL_SECONDS,
      })
      .then(({ access_token }) =>
        fetch(`${config.servers.profile.url}/v1/avatar`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        })
      )
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch avatar');
        return response.json();
      })
      .then((data: { id: string; url: string; avatar?: string }) => {
        if (cancelled) return;
        setAvatarData({
          account: { avatar: { id: data.id, url: data.avatar || data.url } },
        });
      })
      .catch(() => {
        if (!cancelled) setAvatarData(undefined);
      })
      .finally(() => {
        if (!cancelled) setAvatarLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authClient, config, sessionToken]);

  const onContinue = useCallback(
    async (password: string) => {
      if (!sessionToken || !email || !uid) {
        navigateWithQuery('/');
        return;
      }
      // Narrow try around sessionReauth only so a throw from
      // handleNavigation can't be misattributed as an incorrect-password
      // reauth failure.
      let keyFetchToken: string | undefined;
      let unwrapBKey: string | undefined;
      try {
        const emails = await authClient.accountEmails(sessionToken);
        ({ keyFetchToken, unwrapBKey } = await authClient.sessionReauth(
          sessionToken,
          emails,
          password,
          { keys: true, reason: 'signin', metricsContext }
        ));
      } catch (err) {
        const errno = (err as { errno?: number })?.errno;
        // A dead cached session (e.g. after signing out from the browser menu:
        // the server session is gone but local storage kept the token) reauths
        // with INVALID_TOKEN. Clear the stale local session and restart a fresh
        // sign-in rather than dead-ending on an error here.
        if (errno === AuthUiErrors.INVALID_TOKEN.errno) {
          discardSessionToken();
          navigateWithQuery('/');
          return;
        }
        const isIncorrectPassword =
          errno === AuthUiErrors.INCORRECT_PASSWORD.errno;
        if (isPasskey) {
          GleanMetrics.passkeyEnterPassword.submitFrontendError({
            event: {
              reason: isIncorrectPassword
                ? 'incorrect_password'
                : 'server_error',
            },
          });
        }
        setLocalizedErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, err));
        return;
      }

      const { error: navError } = await handleNavigation({
        navigate,
        email,
        signinData: {
          uid,
          sessionToken,
          emailVerified: true,
          sessionVerified: true,
          verificationMethod: isPasskey
            ? VerificationMethods.PASSKEY
            : undefined,
          keyFetchToken,
        },
        unwrapBKey,
        integration,
        finishOAuthFlowHandler,
        queryParams: location.search,
        handleFxaLogin: !syncPreKeysLoginSent,
        handleFxaOAuthLogin: true,
        // On Firefox mobile, the browser finishes Sync sign-in via WebChannel
        // messages; navigating the WebView away would interrupt it and leave
        // Sync paused. Desktop finishes by navigating.
        performNavigation: !integration.isFirefoxMobileClient(),
        authClient,
      });
      if (navError) {
        if (isPasskey) {
          GleanMetrics.passkeyEnterPassword.submitFrontendError({
            event: { reason: 'server_error' },
          });
        }
        setLocalizedErrorMessage(
          getLocalizedErrorMessage(ftlMsgResolver, navError)
        );
        return;
      }

      if (isPasskey) {
        GleanMetrics.passkeyEnterPassword.success({
          event: { reason: passkeySurface },
        });
        // Consolidated terminal-success signal for Looker funnels — fires
        // only once the full Sync sign-in (passkey + existing-password
        // reauth) has completed without error.
        GleanMetrics.passkey.authSuccess({
          event: {
            reason: buildPasskeyAuthSuccessReason(
              passkeySurface,
              'withpassword'
            ),
          },
        });
      }
    },
    [
      authClient,
      ftlMsgResolver,
      finishOAuthFlowHandler,
      integration,
      location.search,
      navigate,
      navigateWithQuery,
      sessionToken,
      email,
      uid,
      passkeySurface,
      metricsContext,
      syncPreKeysLoginSent,
      isPasskey,
    ]
  );

  const missingSigninState = !sessionToken || !email || !uid;

  useEffect(() => {
    if (!oAuthDataError && missingSigninState) {
      navigateWithQuery('/');
    }
  }, [oAuthDataError, missingSigninState, navigateWithQuery]);

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (missingSigninState) {
    return <AppLayout loading />;
  }

  return (
    <SigninPasskeyFallback
      {...{
        email,
        onContinue,
        localizedErrorMessage,
        avatarData,
        avatarLoading,
        passkeySurface,
        reason,
      }}
    />
  );
};

export default SigninPasskeyFallbackContainer;
