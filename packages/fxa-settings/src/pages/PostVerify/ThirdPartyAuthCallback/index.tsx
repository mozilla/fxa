/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useCallback } from 'react';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
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

const ThirdPartyAuthCallback = ({
  flowQueryParams,
}: { flowQueryParams?: QueryParams } & RouteComponentProps) => {
  const account = useAccount();
  const integration = useIntegration();
  const authClient = useAuthClient();
  const location = useLocation();

  console.log('ThirdPartyAuthCallback INTEGRATION', integration?.type);

  if (!integration) {
    throw Error('Integration is required');
  }

  const { finishOAuthFlowHandler } = useFinishOAuthFlowHandler(
    authClient,
    integration || ({} as Integration)
  );

  const storeLinkedAccountData = useCallback(
    async (linkedAccount: LinkedAccountData, verified = true) => {
      const accountData: StoredAccountData = {
        email: linkedAccount.email,
        uid: linkedAccount.uid,
        lastLogin: Date.now(),
        sessionToken: linkedAccount.sessionToken,
        verified,
        metricsEnabled: true,
      };
      return storeAccountData(accountData);
    },
    []
  );

  const verifyThirdPartyAuthResponse = useCallback(async () => {
    if (!isThirdPartyAuthCallbackIntegration(integration)) {
      return;
    }

    const { code: thirdPartyOAuthCode, provider } =
      integration.thirdPartyAuthParams();

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

      console.log('Linked Account', linkedAccount);

      const totp = await authClient.checkTotpTokenExists(
        linkedAccount.sessionToken
      );

      await storeLinkedAccountData(linkedAccount, !totp.verified);

      setCurrentAccount(linkedAccount.uid);

      const fxaParams = (
        integration as ThirdPartyAuthCallbackIntegration
      ).getFxAParams();

      // if (fxaParams.includes('client_id')) {
      // hardNavigate(`/post_verify/third_party_auth/complete${fxaParams.toString()}`);
      hardNavigate(
        `/post_verify/third_party_auth/complete${fxaParams.toString()}`
      );
      // } else {
      // If this isn't an OAuth flow, we can complete the login and navigate to settings
      // return performNavigation(linkedAccount, !(totp.verified));
      // }
    } catch (error) {
      // TODO validate what should happen here
      hardNavigate('/');
    }
  }, [account, flowQueryParams, integration, storeLinkedAccountData]);

  // Ensure we only attempt to verify third party auth creds once
  const isVerifyThirdPartyAuth = useRef(false);
  useEffect(() => {
    const currentData = getCurrentAccountData();
    console.log('Effect Third Party Auth', integration, currentData);

    if (
      isThirdPartyAuthCallbackIntegration(integration) &&
      !isVerifyThirdPartyAuth.current
    ) {
      isVerifyThirdPartyAuth.current = true;
      console.log('Verifying Third Party Auth', integration, currentData);

      verifyThirdPartyAuthResponse();
    }
  }, [integration, verifyThirdPartyAuthResponse]);

  return <LoadingSpinner fullScreen />;
};

export default ThirdPartyAuthCallback;
