/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import {
  Integration,
  isDefault,
  isOAuthWebIntegration,
  OAuthWebIntegration,
  RelierAccount,
  useAuthClient,
  useSession,
} from '../../models';
import { cache } from '../../lib/cache';
import { useCallback, useEffect, useState } from 'react';
import { currentAccount } from '../../lib/cache';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import OAuthDataError from '../../components/OAuthDataError';
import { cachedSignIn, handleNavigation } from '../Signin/utils';
import { AuthError, OAuthError } from '../../lib/oauth/oauth-errors';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { hardNavigate } from 'fxa-react/lib/utils';

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
  const navigate = useNavigate();
  const authClient = useAuthClient();
  const location = useLocation() as ReturnType<typeof useLocation>;
  const session = useSession();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  if (oAuthDataError) {
    setOauthError(oAuthDataError);
  }

  const promptNoneHandler = useCallback(async () => {
    const account = currentAccount();
    const relierAccount = convertToRelierAccount(account, authClient);

    try {
      await (integration as OAuthWebIntegration).validatePromptNoneRequest(
        relierAccount
      );

      const { data, error } = await cachedSignIn(
        account?.sessionToken!,
        authClient,
        cache,
        session
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
            verified: data.verified,
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
      setOauthError(err);
    }
  }, [
    authClient,
    finishOAuthFlowHandler,
    integration,
    location.search,
    session,
  ]);

  useEffect(() => {
    if (isOAuthWebIntegration(integration) && integration.wantsPromptNone()) {
      promptNoneHandler();
      return;
    }

    const urlSearchParams = new URLSearchParams(location.search);
    urlSearchParams.delete('showReactApp');

    if (integration.data.action) {
      if (integration.data.action === 'email') {
        navigate(`/oauth?${urlSearchParams.toString()}`);
      } else {
        hardNavigate(
          `/${integration.data.action}?${urlSearchParams.toString()}`
        );
      }
      return;
    }

    navigate(`/oauth?${urlSearchParams.toString()}`);
  }, [integration, location.search, navigate, promptNoneHandler]);

  if (oauthError) {
    return <OAuthDataError error={oauthError} />;
  }

  return <></>;
};

export default AuthorizationContainer;
