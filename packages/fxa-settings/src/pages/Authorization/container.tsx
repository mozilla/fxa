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
  useSession,
} from '../../models';

import { hardNavigate } from 'fxa-react/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import OAuthDataError from '../../components/OAuthDataError';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { cache, currentAccount } from '../../lib/cache';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import {
  AuthError,
  OAUTH_ERRORS,
  OAuthError,
} from '../../lib/oauth/oauth-errors';
import { cachedSignIn, handleNavigation } from '../Signin/utils';

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
        cache,
        session,
        isOauthPromptNone
      );

      if (error === AuthUiErrors.SESSION_EXPIRED) {
        throw new OAuthError('PROMPT_NONE_NOT_SIGNED_IN');
      }

      if (error) {
        throw error;
      }

      if (!data?.verified) {
        throw new OAuthError('PROMPT_NONE_UNVERIFIED');
      }

      if (data) {
        const navigationOptions = {
          email: account?.email!,
          signinData: {
            // TODO, address signIn.verified vs session.verified discrepancy
            // we're currently using 'sessionVerified' from recovery_email/status
            verified: data.sessionVerified,
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
