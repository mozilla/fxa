/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import {
  Integration,
  isDefault,
  isOAuthWebIntegration,
  OAuthWebIntegration,
  RelierAccount,
  useAuthClient,
  useConfig,
  useSession,
} from '../../models';

import { useCallback, useEffect, useState, useRef } from 'react';
import { currentAccount } from '../../lib/cache';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import OAuthDataError from '../../components/OAuthDataError';
import { cachedSignIn, handleNavigation } from '../Signin/utils';
import {
  AuthError,
  OAUTH_ERRORS,
  OAuthError,
} from '../../lib/oauth/oauth-errors';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { hardNavigate } from 'fxa-react/lib/utils';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';

const convertToRelierAccount = (
  account: ReturnType<typeof currentAccount>,
  authClient: ReturnType<typeof useAuthClient>
) => {
  const relierAccount: RelierAccount = {
    uid: account?.uid!,
    email: account?.email!,
    sessionToken: account?.sessionToken!,
    verifyIdToken: authClient.verifyIdToken,
    isDefault: () => isDefault(account || {}),
  };
  return relierAccount;
};

/**
 * Unlike the other containers, this one does not attempt to render anything.
 * It handles a 'prompt=none' authorization or hand off to the signin routes.
 */
const AuthorizationContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const [oauthError, setOauthError] = useState<AuthError | OAuthError | null>(
    null
  );
  const authClient = useAuthClient();
  const config = useConfig();
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();
  const session = useSession();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  const promptNoneCallCount = useRef(0);

  const promptNoneHandler = useCallback(async () => {
    promptNoneCallCount.current += 1;

    const account = currentAccount();
    const relierAccount = convertToRelierAccount(account, authClient);

    try {
      await (integration as OAuthWebIntegration).validatePromptNoneRequest(
        relierAccount
      );

      const isOauthPromptNone = true;
      const { data, error } = await cachedSignIn(
        account?.sessionToken!,
        authClient,
        session,
        isOauthPromptNone
      );

      if (error === AuthUiErrors.SESSION_EXPIRED) {
        throw new OAuthError('PROMPT_NONE_NOT_SIGNED_IN');
      }

      if (error) {
        throw error;
      }

      if (!data?.emailVerified) {
        throw new OAuthError('PROMPT_NONE_UNVERIFIED');
      }

      // For services that require the non-2FA non-Sync email verification, also check
      // that the session is verified when going through prompt=none.
      const clientId = integration.getClientId();
      if (
        clientId &&
        config.servicesWithEmailVerification.includes(clientId) &&
        data.sessionVerified !== true
      ) {
        throw new OAuthError('PROMPT_NONE_UNVERIFIED');
      }

      if (data) {
        const navigationOptions = {
          email: account?.email!,
          signinData: {
            emailVerified: data.emailVerified,
            sessionVerified: data.sessionVerified,
            verificationMethod: data.verificationMethod,
            verificationReason: data.verificationReason,
            uid: data.uid,
            sessionToken: account?.sessionToken!,
          },
          integration,
          redirectTo: integration.data.redirectTo,
          finishOAuthFlowHandler,
          queryParams: location.search,
        };

        const { error: navError } = await handleNavigation(navigationOptions);

        if (navError) {
          throw navError;
        }
      }
    } catch (err) {
      if ((integration as OAuthWebIntegration).returnOnError()) {
        const url = (
          integration as OAuthWebIntegration
        ).getRedirectWithErrorUrl(err);
        hardNavigate(url);
        return;
      }

      if (
        !(integration as OAuthWebIntegration).returnOnError() &&
        err.errno === OAUTH_ERRORS['PROMPT_NONE_NOT_SIGNED_IN'].errno
      ) {
        navigateWithQuery('/oauth');
        return;
      }

      setOauthError(err);
    }
  }, [
    authClient,
    config,
    finishOAuthFlowHandler,
    integration,
    location.search,
    navigateWithQuery,
    session,
  ]);

  useEffect(() => {
    if (oauthError) {
      return;
    }

    if (promptNoneCallCount.current > 0) {
      return;
    }

    if (isOAuthWebIntegration(integration) && integration.wantsPromptNone()) {
      promptNoneHandler();
      return;
    }

    const urlSearchParams = new URLSearchParams(location.search);
    urlSearchParams.delete('showReactApp');

    if (integration.data.action) {
      if (integration.data.action === 'email') {
        navigateWithQuery('/oauth');
      } else {
        // we'll keep the hard navigate here to support backbone and react pages
        hardNavigate(
          `/${integration.data.action}?${urlSearchParams.toString()}`
        );
      }
      return;
    }

    navigateWithQuery('/oauth');
  }, [
    integration,
    location.search,
    oauthError,
    navigateWithQuery,
    promptNoneHandler,
  ]);

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (oauthError) {
    return <OAuthDataError error={oauthError} />;
  }

  return <></>;
};

export default AuthorizationContainer;
