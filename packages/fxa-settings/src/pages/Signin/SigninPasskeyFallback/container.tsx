/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useCallback, useEffect, useState } from 'react';
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
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import { AccountAvatar } from '../../../lib/interfaces';
import OAuthDataError from '../../../components/OAuthDataError';
import AppLayout from '../../../components/AppLayout';
import VerificationMethods from '../../../constants/verification-methods';
import { getSigninState, handleNavigation } from '../utils';
import { SigninLocationState } from '../interfaces';
import { buildPasskeyAuthSuccessReason } from '../../../lib/passkeys/signin-flow';
import SigninPasskeyFallback from '.';

const SigninPasskeyFallbackContainer = ({
  integration,
}: { integration: Integration } & RouteComponentProps) => {
  const authClient = useAuthClient();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
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
  const passkeySurface = signinState?.passkeySurface ?? 'emailfirst';

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
        ({ keyFetchToken, unwrapBKey } = await authClient.sessionReauth(
          sessionToken,
          email,
          password,
          { keys: true }
        ));
      } catch (err) {
        const errno = (err as { errno?: number })?.errno;
        const isIncorrectPassword =
          errno === AuthUiErrors.INCORRECT_PASSWORD.errno;
        GleanMetrics.passkeyEnterPassword.submitFrontendError({
          event: {
            reason: isIncorrectPassword ? 'incorrect_password' : 'server_error',
          },
        });
        setLocalizedErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, err));
        return;
      }

      const { error: navError } = await handleNavigation({
        email,
        signinData: {
          uid,
          sessionToken,
          emailVerified: true,
          sessionVerified: true,
          verificationMethod: VerificationMethods.PASSKEY,
          keyFetchToken,
        },
        unwrapBKey,
        integration,
        finishOAuthFlowHandler,
        queryParams: location.search,
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
        // On mobile, navigating the WebView away leaves Sync paused; let Firefox
        // drive completion via WebChannel instead.
        performNavigation: !integration.isFirefoxMobileClient(),
      });
      if (navError) {
        GleanMetrics.passkeyEnterPassword.submitFrontendError({
          event: { reason: 'server_error' },
        });
        setLocalizedErrorMessage(
          getLocalizedErrorMessage(ftlMsgResolver, navError)
        );
        return;
      }

      GleanMetrics.passkeyEnterPassword.success({
        event: { reason: passkeySurface },
      });
      // Consolidated terminal-success signal for Looker funnels — fires
      // only once the full Sync sign-in (passkey + existing-password
      // reauth) has completed without error.
      GleanMetrics.passkey.authSuccess({
        event: {
          reason: buildPasskeyAuthSuccessReason(passkeySurface, 'withpassword'),
        },
      });
    },
    [
      authClient,
      ftlMsgResolver,
      finishOAuthFlowHandler,
      integration,
      location.search,
      navigateWithQuery,
      sessionToken,
      email,
      uid,
      passkeySurface,
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
      }}
    />
  );
};

export default SigninPasskeyFallbackContainer;
