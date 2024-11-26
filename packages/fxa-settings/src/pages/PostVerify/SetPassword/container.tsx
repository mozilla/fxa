/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import SetPassword from '.';
import { currentAccount } from '../../../lib/cache';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import {
  Integration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import { cache } from '../../../lib/cache';
import { useCallback } from 'react';
import { CreatePasswordHandler } from './interfaces';
import { HandledError } from '../../../lib/error-utils';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import useSyncEngines from '../../../lib/hooks/useSyncEngines';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import OAuthDataError from '../../../components/OAuthDataError';
import { AUTH_DATA_KEY } from '../../../lib/sensitive-data-client';
import { NavigationOptions } from '../../Signin/interfaces';
import { handleNavigation } from '../../Signin/utils';
import GleanMetrics from '../../../lib/glean';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';

const SetPasswordContainer = ({
  integration,
  flowQueryParams,
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const navigate = useNavigate();
  const authClient = useAuthClient();
  const storedLocalAccount = currentAccount();
  const email = storedLocalAccount?.email;
  const sessionToken = storedLocalAccount?.sessionToken;
  const uid = storedLocalAccount?.uid;

  const {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    setDeclinedSyncEngines,
    selectedEngines,
  } = useSyncEngines(integration);
  const sensitiveDataClient = useSensitiveDataClient();
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

          sensitiveDataClient.setData(AUTH_DATA_KEY, {
            // Store for inline recovery key flow
            authPW,
            emailForAuth: email,
            unwrapBKey,
          });

          const keyFetchToken = await getKeyFetchToken(
            authPW,
            email,
            sessionToken
          );

          GleanMetrics.thirdPartyAuthSetPassword.success({
            sync: { cwts: selectedEngines },
          });

          const navigationOptions: NavigationOptions = {
            email,
            signinData: {
              uid,
              sessionToken,
              verified: true,
              keyFetchToken,
            },
            unwrapBKey,
            integration,
            finishOAuthFlowHandler,
            queryParams: location.search,
            handleFxaLogin: true,
            handleFxaOAuthLogin: true,
            showInlineRecoveryKeySetup: true,
            syncEngines: {
              offeredEngines: offeredSyncEngines,
              declinedEngines: declinedSyncEngines,
            },
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
      selectedEngines,
      sensitiveDataClient,
      location.search,
    ]
  );

  // Users must be already authenticated on this page.
  // This page is currently always for the Sync flow.
  if (!email || !sessionToken || !uid || !integration.isSync()) {
    navigate('/signin', { replace: true });
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
        setDeclinedSyncEngines,
      }}
    />
  );
};

export default SetPasswordContainer;
