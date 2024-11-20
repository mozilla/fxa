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
  BaseIntegration,
  IntegrationType,
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
  GenericData,
  StorageData,
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

const initializeIntegration = (
  originalParams: URLSearchParams,
  clientInfoState: any,
  productInfoState: any
) => {
  const windowWrapper = new ReachRouterWindow();
  const urlQueryData = new UrlQueryData(windowWrapper);
  let integration = new BaseIntegration(IntegrationType.Web, urlQueryData);

  try {
    console.log('Initializing integration');
    // The `state` param returned by third party auth provider contains the
    // original FxA OAuth request params. We need to extract them and build
    // a new integration based on that.
    const state = decodeURIComponent(originalParams.get('state') || '');
    const stateParams = new URLSearchParams(new URL(state).search);

    // Update the URL query data with FxA OAuth request params
    urlQueryData.setParams(stateParams);

    const paramsObject = Object.fromEntries(stateParams.entries());
    const data = new GenericData(paramsObject);

    const flags = new DefaultIntegrationFlags(
      urlQueryData,
      new StorageData(windowWrapper)
    );
    const integrationFactory = new IntegrationFactory({
      window: windowWrapper,
      data,
      flags,
      clientInfo: clientInfoState.data?.clientInfo,
      productInfo: productInfoState.data?.productInfo,
    });

    integration = integrationFactory.getIntegration();
    console.log('Integration initialized', integration);
  } catch (error) {
    console.error('Error initializing integration', error);
  }

  return integration;
};

const ThirdPartyAuthCallback = ({
  flowQueryParams,
}: { flowQueryParams?: QueryParams } & RouteComponentProps) => {
  const account = useAccount();
  const authClient = useAuthClient();
  const clientInfoState = useClientInfoState();
  const productInfoState = useProductInfoState();
  const location = useLocation();

  const originalParams = new URLSearchParams(window.location.search);
  const integration = initializeIntegration(
    originalParams,
    clientInfoState,
    productInfoState
  );

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
    const code = originalParams.get('code');
    const providerFromParams = originalParams.get('provider');
    let provider: AUTH_PROVIDER | undefined;
    if (providerFromParams === 'apple') {
      provider = AUTH_PROVIDER.APPLE;
    } else {
      provider = AUTH_PROVIDER.GOOGLE;
    }

    return { code, provider };
  };

  const navigateNext = async (linkedAccount: LinkedAccountData) => {
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

  const isSigningIn = useRef(false);
  useEffect(() => {
    if (!isSigningIn.current) {
      isSigningIn.current = true;
      verifyOAuthResponseAndSignIn();
    }
  });

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
