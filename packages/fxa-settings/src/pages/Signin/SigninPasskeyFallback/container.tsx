/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useNavigate, useLocation } from 'react-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Integration, useAuthClient, useFtlMsgResolver } from '../../../models';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { useSigninAvatar } from '../useSigninAvatar';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import OAuthDataError from '../../../components/OAuthDataError';
import AppLayout from '../../../components/AppLayout';
import VerificationMethods from '../../../constants/verification-methods';
import { getSigninState, handleNavigation } from '../utils';
import { SigninLocationState } from '../interfaces';
import { buildPasskeyAuthSuccessReason } from '../../../lib/passkeys/signin-flow';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import { QueryParams } from '../../..';
import SigninPasskeyFallback, { SigninPasskeyFallbackContinueError } from '.';

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

  const sessionToken = signinState?.sessionToken;
  const email = signinState?.email;
  const uid = signinState?.uid;
  const passkeySurface = location.state?.passkeySurface ?? 'emailfirst';
  const metricsContext = useMemo(
    () => queryParamsToMetricsContext(flowQueryParams),
    [flowQueryParams]
  );

  const { avatarData, avatarLoading } = useSigninAvatar(sessionToken);

  const onContinue = useCallback(
    async (
      password: string
    ): Promise<SigninPasskeyFallbackContinueError | undefined> => {
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
        const isIncorrectPassword =
          errno === AuthUiErrors.INCORRECT_PASSWORD.errno;
        GleanMetrics.passkeyEnterPassword.submitFrontendError({
          event: {
            reason: isIncorrectPassword ? 'incorrect_password' : 'server_error',
          },
        });
        return {
          errno,
          localizedErrorMessage: getLocalizedErrorMessage(ftlMsgResolver, err),
        };
      }

      const { error: navError } = await handleNavigation({
        navigate,
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
        // On Firefox mobile, the browser finishes Sync sign-in via WebChannel
        // messages; navigating the WebView away would interrupt it and leave
        // Sync paused. Desktop finishes by navigating.
        performNavigation: !integration.isFirefoxMobileClient(),
        authClient,
      });
      if (navError) {
        GleanMetrics.passkeyEnterPassword.submitFrontendError({
          event: { reason: 'navigation_error' },
        });
        return {
          localizedErrorMessage: getLocalizedErrorMessage(
            ftlMsgResolver,
            navError
          ),
        };
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
      return undefined;
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
        avatarData,
        avatarLoading,
        passkeySurface,
      }}
    />
  );
};

export default SigninPasskeyFallbackContainer;
