/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useCallback } from 'react';
import { hardNavigate } from 'fxa-react/lib/utils';
import { RouteComponentProps, useLocation } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import {
  useAccount,
  useAuthClient,
  Integration,
  isWebIntegration,
} from '../../../models';
import { handleNavigation } from '../../Signin/utils';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import {
  StoredAccountData,
  storeAccountData,
  setCurrentAccount,
} from '../../../lib/storage-utils';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import { isThirdPartyAuthCallbackIntegration } from '../../../models/integrations/third-party-auth-callback-integration';
import VerificationMethods from '../../../constants/verification-methods';
import VerificationReasons from '../../../constants/verification-reasons';
import { currentAccount } from '../../../lib/cache';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';

type LinkedAccountData = {
  uid: hexstring;
  sessionToken: hexstring;
  providerUid: hexstring;
  email: string;
  verificationMethod?: string;
};

const ThirdPartyAuthCallback = ({
  integration,
  flowQueryParams,
}: {
  integration: Integration;
  flowQueryParams?: QueryParams;
} & RouteComponentProps) => {
  const account = useAccount();
  const authClient = useAuthClient();
  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);
  const location = useLocation();

  const { finishOAuthFlowHandler } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const storeLinkedAccountData = useCallback(
    async (linkedAccount: LinkedAccountData, needsVerification = false) => {
      const accountData: StoredAccountData = {
        email: linkedAccount.email,
        uid: linkedAccount.uid,
        lastLogin: Date.now(),
        sessionToken: linkedAccount.sessionToken,
        verified: !needsVerification,
        metricsEnabled: true,
      };
      return storeAccountData(accountData);
    },
    []
  );

  /**
   * Navigate to the next page
   * if Sync based integration -> navigate to set password or sign-in
   * if OAuth based integration -> verify OAuth and navigate to RP
   * if web redirect (SubPlat) -> navigate back to SubPlat
   * if neither -> navigate to settings
   */
  const performNavigation = useCallback(
    async (linkedAccount: LinkedAccountData, needsVerification = false) => {
      const navigationOptions = {
        email: linkedAccount.email,
        signinData: {
          uid: linkedAccount.uid,
          sessionToken: linkedAccount.sessionToken,
          verified: !needsVerification,
          verificationMethod: needsVerification
            ? VerificationMethods.TOTP_2FA
            : undefined,
          verificationReason: needsVerification
            ? VerificationReasons.SIGN_IN
            : undefined,
        },
        integration,
        redirectTo:
          isWebIntegration(integration) && webRedirectCheck?.isValid
            ? integration.data.redirectTo
            : '',
        finishOAuthFlowHandler,
        queryParams: location.search,
        isSignInWithThirdPartyAuth: true,
        handleFxaLogin: false,
        handleFxaOAuthLogin: false,
      };

      const { error: navError } = await handleNavigation(navigationOptions);

      if (navError) {
        // TODO validate what should happen here
        hardNavigate('/');
      }
    },
    [finishOAuthFlowHandler, integration, location.search, webRedirectCheck]
  );

  const verifyThirdPartyAuthResponse = useCallback(async () => {
    if (!isThirdPartyAuthCallbackIntegration(integration)) {
      return;
    }

    const { code: thirdPartyOAuthCode, provider } =
      integration.thirdPartyAuthParams();

    if (!thirdPartyOAuthCode) {
      return;
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

      const totpRequired =
        linkedAccount.verificationMethod === VerificationMethods.TOTP_2FA;

      await storeLinkedAccountData(linkedAccount, totpRequired);

      setCurrentAccount(linkedAccount.uid);

      const fxaParams = integration.getFxAParams();

      // HACK: Hard navigate is required here to ensure that the new integration
      // is created based off updated search params.
      hardNavigate(
        `/post_verify/third_party_auth/callback${fxaParams.toString()}`
      );
    } catch (error) {
      // TODO validate what should happen here
      hardNavigate('/');
    }
  }, [account, flowQueryParams, integration, storeLinkedAccountData]);

  const navigateNext = useCallback(
    async (linkedAccount: LinkedAccountData) => {
      const totp = await authClient.checkTotpTokenExists(
        linkedAccount.sessionToken
      );

      performNavigation(linkedAccount, totp.verified);
    },
    [performNavigation, authClient]
  );

  // Ensure we only attempt to verify third party auth creds once
  const isVerifyThirdPartyAuth = useRef(false);
  useEffect(() => {
    if (isVerifyThirdPartyAuth.current) {
      return;
    }
    if (isThirdPartyAuthCallbackIntegration(integration)) {
      isVerifyThirdPartyAuth.current = true;

      if (integration.getError()) {
        const fxaParams = integration.getFxAParams();
        return hardNavigate(`/${fxaParams.toString()}`);
      }

      verifyThirdPartyAuthResponse();
    }
  }, [integration, verifyThirdPartyAuthResponse]);

  // Once we have verified the third party auth, navigate to the next page
  const isVerifyFxAAuth = useRef(false);
  useEffect(() => {
    if (isVerifyFxAAuth.current) {
      return;
    }

    const currentData = currentAccount() as LinkedAccountData;
    if (
      integration &&
      !isThirdPartyAuthCallbackIntegration(integration) &&
      currentData &&
      currentData.sessionToken
    ) {
      isVerifyFxAAuth.current = true;
      navigateNext(currentData);
    }
  }, [integration, navigateNext]);

  return <LoadingSpinner fullScreen />;
};

export default ThirdPartyAuthCallback;
