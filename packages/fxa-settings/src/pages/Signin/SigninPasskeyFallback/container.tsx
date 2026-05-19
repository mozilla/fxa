/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useCallback, useEffect, useState } from 'react';
import { Integration, useAuthClient, useFtlMsgResolver } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import OAuthDataError from '../../../components/OAuthDataError';
import AppLayout from '../../../components/AppLayout';
import VerificationMethods from '../../../constants/verification-methods';
import { getSigninState, handleNavigation } from '../utils';
import { SigninLocationState } from '../interfaces';
import SigninPasskeyFallback from '.';

const SigninPasskeyFallbackContainer = ({
  integration,
}: { integration: Integration } & RouteComponentProps) => {
  const authClient = useAuthClient();
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

  const onContinue = useCallback(
    async (password: string) => {
      if (!sessionToken || !email || !uid) {
        navigateWithQuery('/');
        return;
      }
      try {
        const { keyFetchToken, unwrapBKey } = await authClient.sessionReauth(
          sessionToken,
          email,
          password,
          { keys: true }
        );
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
        });
        if (navError) {
          setLocalizedErrorMessage(
            getLocalizedErrorMessage(ftlMsgResolver, navError)
          );
        }
      } catch (err) {
        setLocalizedErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, err));
      }
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
    ]
  );

  // User opted out of Sync; account is still signed in (passkey-verified).
  const onGoToSettings = useCallback(() => {
    navigateWithQuery('/settings');
  }, [navigateWithQuery]);

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
      {...{ email, onContinue, onGoToSettings, localizedErrorMessage }}
    />
  );
};

export default SigninPasskeyFallbackContainer;
