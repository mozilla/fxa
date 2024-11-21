/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useCallback } from 'react';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { RouteComponentProps, useLocation } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../../../components/AppLayout';
import {
  useAccount,
  useIntegration,
  useAuthClient,
  Integration,
} from '../../../models';
import { handleNavigation } from '../../Signin/utils';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import {
  StoredAccountData,
  storeAccountData,
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

const ThirdPartyAuthCallback = ({
  flowQueryParams,
}: { flowQueryParams?: QueryParams } & RouteComponentProps) => {
  const account = useAccount();
  const integration = useIntegration();
  const authClient = useAuthClient();
  const location = useLocation();

  const linkedAccountData = useRef({} as LinkedAccountData);

  const { finishOAuthFlowHandler } = useFinishOAuthFlowHandler(
    authClient,
    integration || ({} as Integration)
  );

  const storeLinkedAccountData = useCallback(
    async (linkedAccount: LinkedAccountData) => {
      const accountData: StoredAccountData = {
        email: linkedAccount.email,
        uid: linkedAccount.uid,
        lastLogin: Date.now(),
        sessionToken: linkedAccount.sessionToken,
        verified: true,
        metricsEnabled: true,
      };
      return storeAccountData(accountData);
    },
    []
  );

  const verifyThirdPartyAuthResponse = useCallback(async () => {
    const { code: thirdPartyOAuthCode, provider } = (
      integration as ThirdPartyAuthCallbackIntegration
    ).thirdPartyAuthParams();

    if (!thirdPartyOAuthCode) {
      return hardNavigate('/');
    }

    try {
      const linkedAccount: LinkedAccountData =
        await account.verifyAccountThirdParty(
          thirdPartyOAuthCode,
          provider,
          undefined,
          queryParamsToMetricsContext(
            flowQueryParams as unknown as Record<string, string>
          )
        );
      await storeLinkedAccountData(linkedAccount);

      linkedAccountData.current = linkedAccount;

      const fxaParams = (
        integration as ThirdPartyAuthCallbackIntegration
      ).getFxAParams();

      // HACK: Force the query params to be set in the URL, which then loads
      // the integration stored in ThirdPartyAuthCallbackIntegration `state` value.
      const urlQueryData = new UrlQueryData(new ReachRouterWindow());
      urlQueryData.setParams(new URLSearchParams(fxaParams));
    } catch (error) {
      // TODO validate what should happen here
      hardNavigate('/');
    }
  }, [account, flowQueryParams, integration, storeLinkedAccountData]);

  /**
   * Navigate to the next page
   if Sync based integration -> navigate to set password or sign-in
   if OAuth based integration -> verify OAuth and navigate to RP
   if neither -> navigate to settings
   */
  const performNavigation = useCallback(
    async (linkedAccount: LinkedAccountData) => {
      if (!integration) {
        return;
      }

      const navigationOptions = {
        email: linkedAccount.email,
        signinData: {
          uid: linkedAccount.uid,
          sessionToken: linkedAccount.sessionToken,
          verified: true,
        },
        integration,
        finishOAuthFlowHandler,
        queryParams: location.search,
      };

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

      performNavigation(linkedAccount);
    },
    [integration, performNavigation]
  );

  // Ensure we only attempt to verify third party auth creds once
  useEffect(() => {
    if (isThirdPartyAuthCallbackIntegration(integration)) {
      verifyThirdPartyAuthResponse();
    }
  }, [integration, verifyThirdPartyAuthResponse]);

  // Once we have verified the third party auth, navigate to the next page
  useEffect(() => {
    if (integration && linkedAccountData.current.sessionToken) {
      navigateNext(linkedAccountData.current);
    }
  }, [integration, navigateNext]);

  return (
    <AppLayout>
      <div className="flex flex-col">
        <FtlMsg id="third-party-auth-callback-message">
          Please wait, you are being redirected to the authorized application.
        </FtlMsg>
        <LoadingSpinner className="flex items-center flex-col justify-center mt-4 select-none" />
      </div>
    </AppLayout>
  );
};

export default ThirdPartyAuthCallback;
