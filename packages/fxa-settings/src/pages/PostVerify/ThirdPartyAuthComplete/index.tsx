/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useCallback } from 'react';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../../../components/AppLayout';
import {
  useAccount,
  useIntegration,
  useAuthClient,
  Integration,
  isOAuthIntegration,
} from '../../../models';
import { handleNavigation } from '../../Signin/utils';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import {
  StoredAccountData,
  storeAccountData,
  setCurrentAccount,
  getCurrentAccountData,
} from '../../../lib/storage-utils';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import {
  isThirdPartyAuthCallbackIntegration,
  ThirdPartyAuthCallbackIntegration,
} from '../../../models/integrations/third-party-auth-callback-integration';
import { ReachRouterWindow } from '../../../lib/window';
import { UrlQueryData } from '../../../lib/model-data';

type LinkedAccountData = {
  uid: hexstring;
  sessionToken: hexstring;
  providerUid: hexstring;
  email: string;
  verificationMethod?: string;
};

const ThirdPartyAuthComplete = ({
  flowQueryParams,
}: { flowQueryParams?: QueryParams } & RouteComponentProps) => {
  const integration = useIntegration();
  const authClient = useAuthClient();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('ThirdPartyAuthComplete INTEGRATION', integration?.type);

  const urlQueryData = new UrlQueryData(new ReachRouterWindow());

  const { finishOAuthFlowHandler } = useFinishOAuthFlowHandler(
    authClient,
    integration || ({} as Integration)
  );

  /**
   * Navigate to the next page
   if Sync based integration -> navigate to set password or sign-in
   if OAuth based integration -> verify OAuth and navigate to RP
   if neither -> navigate to settings
   */
  const performNavigation = useCallback(
    async (
      linkedAccount: LinkedAccountData,
      verified = true,
      queryParams = location.search
    ) => {
      if (!integration) {
        return;
      }

      const navigationOptions = {
        email: linkedAccount.email,
        signinData: {
          uid: linkedAccount.uid,
          sessionToken: linkedAccount.sessionToken,
          verified,
        },
        integration,
        finishOAuthFlowHandler,
        queryParams,
      };

      console.log('performNavigation', queryParams);
      const { error: navError } = await handleNavigation(navigationOptions, {
        handleFxaLogin: false,
        handleFxaOAuthLogin: false,
      });

      if (navError) {
        // TODO validate what should happen here
        hardNavigate('/');
      }
    },
    [finishOAuthFlowHandler, integration, location.search]
  );

  const navigateNext = useCallback(
    async (linkedAccount: LinkedAccountData) => {
      if (!integration) {
        return;
      }
      const totp = await authClient.checkTotpTokenExists(
        linkedAccount.sessionToken
      );

      performNavigation(linkedAccount, !totp.verified);
    },
    [integration, performNavigation, authClient]
  );

  // Once we have verified the third party auth, navigate to the next page
  const isVerifyFxAAuth = useRef(false);
  useEffect(() => {
    const currentData = getCurrentAccountData();
    console.log('Effect Verifying FxA Auth', integration, currentData);
    if (
      integration &&
      !isThirdPartyAuthCallbackIntegration(integration) &&
      currentData &&
      currentData.sessionToken &&
      !isVerifyFxAAuth.current
    ) {
      isVerifyFxAAuth.current = true;
      console.log('Verifying FxA Auth', integration, currentData);
      navigateNext(currentData as LinkedAccountData);
    }
  }, [integration, navigateNext]);

  return <LoadingSpinner fullScreen />;
};

export default ThirdPartyAuthComplete;
