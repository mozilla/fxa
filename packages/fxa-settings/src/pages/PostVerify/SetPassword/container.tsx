/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import SetPassword from '.';
import { currentAccount } from '../../../lib/cache';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { Integration, useAuthClient } from '../../../models';
import { cache } from '../../../lib/cache';
import { useCallback } from 'react';
import { CreatePasswordHandler } from './interfaces';
import { HandledError } from '../../../lib/error-utils';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import OAuthDataError from '../../../components/OAuthDataError';
import { NavigationOptions } from '../../Signin/interfaces';
import { handleNavigation } from '../../Signin/utils';
import GleanMetrics from '../../../lib/glean';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import useSyncEngines from '../../../lib/hooks/useSyncEngines';

const SetPasswordContainer = ({
  integration,
  flowQueryParams,
  useSyncEnginesResult: {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    selectedEnginesForGlean,
  },
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
  useSyncEnginesResult: ReturnType<typeof useSyncEngines>;
} & RouteComponentProps) => {
  const navigateWithQuery = useNavigateWithQuery();
  const authClient = useAuthClient();
  const storedLocalAccount = currentAccount();
  const email = storedLocalAccount?.email;
  const sessionToken = storedLocalAccount?.sessionToken;
  const uid = storedLocalAccount?.uid;

  const location = useLocation();
  const metricsContext = queryParamsToMetricsContext(
    flowQueryParams as unknown as Record<string, string>
  );

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
          const { passwordCreated, authPW, unwrapBKey } =
            await authClient.createPassword(sessionToken, email, newPassword);
          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              passwordCreated() {
                return passwordCreated;
              },
            },
          });

          const keyFetchToken = await getKeyFetchToken(
            authPW,
            email,
            sessionToken
          );

          GleanMetrics.thirdPartyAuthSetPassword.success({
            sync: { cwts: selectedEnginesForGlean },
          });

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
      offeredSyncEngines,
      selectedEnginesForGlean,
      location.search,
    ]
  );

  // Users must be already authenticated on this page.
  // This page is currently always for the Sync flow.
  if (!email || !sessionToken || !uid || !integration.isSync()) {
    navigateWithQuery('/signin', { replace: true });
    return <LoadingSpinner />;
  }
  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
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
      }}
    />
  );
};

export default SetPasswordContainer;
