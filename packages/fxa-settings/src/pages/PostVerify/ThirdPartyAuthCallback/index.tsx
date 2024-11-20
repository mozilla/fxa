/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { RouteComponentProps, useLocation } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../../../components/AppLayout';
import { AUTH_PROVIDER } from 'fxa-auth-client/browser';
import {
  useAccount,
  useClientInfoState,
  useProductInfoState,
} from '../../../models';
import {
  StoredAccountData,
  storeAccountData,
} from '../../../lib/storage-utils';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import { handleNavigation } from '../../Signin/utils';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { useAuthClient } from '../../../models';
import {
  DefaultIntegrationFlags,
  IntegrationFactory,
} from '../../../lib/integrations';
import {
  StorageData,
  UrlHashData,
  UrlQueryData,
} from '../../../lib/model-data';
import { ReachRouterWindow } from '../../../lib/window';

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
  const authClient = useAuthClient();
  const clientInfoState = useClientInfoState();
  const productInfoState = useProductInfoState();
  const location = useLocation();

  const windowWrapper = new ReachRouterWindow();
  const urlQueryData = new UrlQueryData(windowWrapper);

  const queryParams = new URLSearchParams(location.search);

  let thirdPartyAuthCode = queryParams.get('thirdPartyAuthCode');
  let thirdPartyAuthProvider = queryParams.get('thirdPartyAuthProvider');

  // Initialize integration based on the original FxA OAuth request params
  const urlHashData = new UrlHashData(windowWrapper);
  const storageData = new StorageData(windowWrapper);
  const flags = new DefaultIntegrationFlags(urlQueryData, storageData);
  const integrationFactory = new IntegrationFactory({
    flags,
    window: windowWrapper,
    clientInfo: clientInfoState.data?.clientInfo,
    productInfo: productInfoState.data?.productInfo,
    data: urlQueryData,
    channelData: urlHashData,
    storageData,
  });
  const integration = integrationFactory.getIntegration();

  const { finishOAuthFlowHandler } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const storeLinkedAccountData = async (linkedAccount: LinkedAccountData) => {
    const accountData: StoredAccountData = {
      email: linkedAccount.email,
      uid: linkedAccount.uid,
      lastLogin: Date.now(),
      sessionToken: linkedAccount.sessionToken,
      verified: true,
      metricsEnabled: true,
    };
    return storeAccountData(accountData);
  };

  const getAuthParams = () => {
    const code = thirdPartyAuthCode;
    const providerFromParams = thirdPartyAuthProvider;
    let provider: AUTH_PROVIDER | undefined;
    if (providerFromParams === 'apple') {
      provider = AUTH_PROVIDER.APPLE;
    } else {
      provider = AUTH_PROVIDER.GOOGLE;
    }

    return { code, provider };
  };

  const navigateNext = async (linkedAccount: LinkedAccountData) => {
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
      handleFxaOAuthLogin: true,
    });

    if (navError) {
      console.log('navError', navError);
    }
  };

  async function verifyOAuthResponseAndSignIn() {
    const { code: thirdPartyOAuthCode, provider } = getAuthParams();

    if (thirdPartyOAuthCode && provider) {
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
        await navigateNext(linkedAccount);
      } catch (error) {
        console.log('error', error);
      }
    } else {
      // TODO validate what should happen if we hit this page
      // without the required auth params to verify the account
      hardNavigate('/');
    }
  }

  // Ensure we only attempt to sign in once
  const isSigningIn = useRef(false);
  useEffect(() => {
    if (!isSigningIn.current && thirdPartyAuthCode) {
      isSigningIn.current = true;
      verifyOAuthResponseAndSignIn();
    }
  });

  // During the third party auth flow, we store the original FxA OAuth request
  // as the state query param. This is used to restore the original OAuth request.
  useEffect(() => {
    const originalParams = new URLSearchParams(location.search);
    const state = originalParams.get('state');
    if (state) {
      const decodedState = decodeURIComponent(state);
      try {
        urlQueryData.setParams(
          new URLSearchParams(new URL(decodedState).search)
        );
        thirdPartyAuthCode = originalParams.get('code');
        thirdPartyAuthProvider = originalParams.get('provider');
        urlQueryData.set('thirdPartyAuthCode', thirdPartyAuthCode || '');
        urlQueryData.set(
          'thirdPartyAuthProvider',
          thirdPartyAuthProvider || ''
        );
      } catch (e) {
        console.error('Error replacing state in history', e);
      }
    }
  }, []);

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
