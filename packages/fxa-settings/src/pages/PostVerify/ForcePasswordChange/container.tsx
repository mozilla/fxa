/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import ForcePasswordChange from '.';
import AppLayout from '../../../components/AppLayout';
import OAuthDataError from '../../../components/OAuthDataError';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { currentAccount } from '../../../lib/cache';
import firefox from '../../../lib/channels/firefox';
import { HandledError } from '../../../lib/error-utils';
import { useNavigateWithQuery } from '../../../lib/hooks';
import type { UseFxAStatusResult } from '../../../lib/hooks';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { storeAccountData } from '../../../lib/storage-utils';
import { Integration, useAuthClient } from '../../../models';
import { handleNavigation } from '../../Signin/utils';
import { ChangePasswordHandler } from './interfaces';

const ForcePasswordChangeContainer = ({
  integration,
  useFxAStatusResult: { offeredSyncEngines, declinedSyncEngines },
}: {
  integration: Integration;
  useFxAStatusResult: UseFxAStatusResult;
}) => {
  const navigate = useNavigate();
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation();
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const storedLocalAccount = currentAccount();
  const email = storedLocalAccount?.email;
  const sessionToken = storedLocalAccount?.sessionToken;
  const isSignedIn = !!email && !!sessionToken;

  // Users must already be signed in; anyone else starts at email-first.
  useEffect(() => {
    if (!isSignedIn) {
      navigateWithQuery('/', { replace: true });
    }
  }, [isSignedIn, navigateWithQuery]);

  const changePasswordHandler: ChangePasswordHandler = useCallback(
    async (oldPassword, newPassword) => {
      if (!email || !sessionToken) {
        return { error: AuthUiErrors.UNEXPECTED_ERROR as HandledError };
      }
      try {
        const emails = await authClient.accountEmails(sessionToken);
        const response = await authClient.passwordChange(
          emails,
          oldPassword,
          newPassword,
          sessionToken,
          { keys: integration.wantsKeys() }
        );
        // The finish endpoint returns `verified`, not the typed `sessionVerified`.
        const { verified: sessionVerified } = response as typeof response & {
          verified: boolean;
        };

        // The password change destroys the old session token.
        storeAccountData({
          uid: response.uid,
          email,
          sessionToken: response.sessionToken,
          verified: true,
          sessionVerified,
          hasPassword: true,
        });
        firefox.passwordChanged(
          email,
          response.uid,
          response.sessionToken,
          sessionVerified,
          response.keyFetchToken,
          response.unwrapBKey
        );

        const { error } = await handleNavigation({
          navigate,
          email,
          signinData: {
            uid: response.uid,
            sessionToken: response.sessionToken,
            emailVerified: true,
            sessionVerified,
            keyFetchToken: response.keyFetchToken,
          },
          unwrapBKey: response.unwrapBKey,
          integration,
          finishOAuthFlowHandler,
          queryParams: location.search,
          handleFxaLogin: true,
          handleFxaOAuthLogin: true,
          syncEngines: {
            offeredEngines: offeredSyncEngines,
            declinedEngines: declinedSyncEngines,
          },
          // Mobile clients close the web view; navigating first would flash.
          performNavigation: !integration.isFirefoxMobileClient(),
          authClient,
        });
        return { error: error ?? null };
      } catch (error) {
        const { errno } = error as HandledError;
        if (errno && AuthUiErrorNos[errno]) {
          return { error: error as HandledError };
        }
        return { error: AuthUiErrors.UNEXPECTED_ERROR as HandledError };
      }
    },
    [
      authClient,
      declinedSyncEngines,
      email,
      finishOAuthFlowHandler,
      integration,
      location.search,
      navigate,
      offeredSyncEngines,
      sessionToken,
    ]
  );

  if (!isSignedIn) {
    return <AppLayout loading />;
  }
  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  return <ForcePasswordChange {...{ email, changePasswordHandler }} />;
};

export default ForcePasswordChangeContainer;
