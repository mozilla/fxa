/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../../../components/AppLayout';
import { AUTH_PROVIDER } from 'fxa-auth-client/browser';
import { useAccount } from '../../../models';
import {
  StoredAccountData,
  storeAccountData,
} from '../../../lib/storage-utils';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';

type LinkedAccountData = {
  uid: hexstring;
  sessionToken: hexstring;
  providerUid: hexstring;
  email: string;
  verificationMethod?: string;
};

// TODO this page to be completed/activated in FXA-8834
// User reaches this page when redirected back from third party auth provider.
// It requires /post_verify/third_party_auth/callback route to be turned on for react
// otherwise, users authenticating with the react version of signin/signup are directed
// to the backbone version of the callback to complete their third party authentication.

// All use of params should be reworked to use `useValidatedQueryParams` hook in FXA-8834

const ThirdPartyAuthCallback = ({
  flowQueryParams,
}: { flowQueryParams?: QueryParams } & RouteComponentProps) => {
  const navigate = useNavigate();
  const account = useAccount();
  const params = new URLSearchParams(window.location.search);

  const getRedirectUrl = () => {
    // get the stashed state with origin information
    // use it to reconstruct redirect for oauth
    // the state is the entire URL of the origin and includes the redirect_uri in a param
    // if authenticating from a RP
    const state = params.get('state');
    if (state) {
      // we may need to deconstruct the state to access/modify the redirect URL
      const stateParams = new URL(decodeURIComponent(state)).searchParams;
      const redirect = stateParams.get('redirect_uri');
      // if the state contains a redirect_uri, we need to redirect to RP
      // otherwise we redirect internally
      if (redirect) {
        const url = new URL(redirect);
        // TODO append other params from state to the redirect URL
        return url;
      }
    }
    return undefined;
  };

  // Persist account data to local storage to match parity with content-server
  // this allows the recent account to be used for /signin
  const storeLinkedAccountData = async (linkedAccount: LinkedAccountData) => {
    const accountData: StoredAccountData = {
      // We are using the email that was returned from the Third Party Auth
      // Not the email entered in the email-first form as they might be different
      email: linkedAccount.email,
      uid: linkedAccount.uid,
      lastLogin: Date.now(),
      sessionToken: linkedAccount.sessionToken,
      verified: true,
      metricsEnabled: true,
    };

    storeAccountData(accountData);
  };

  const completeSignIn = async (linkedAccount: LinkedAccountData) => {
    // TODO in FXA-8834, use SignIn method that should be ported in FXA-6488
    // to complete sign in with the sessionToken obtained when verifying the third party auth
    // this should also update graphQL cache (isSignedIn:true)
    // await account.signIn(linkedAccount)

    await storeLinkedAccountData(linkedAccount);

    // TODO ensure correct redirects for all integrations (OAuth, Desktop, Mobile)
    // redirect is constructed from state param in the URL params
    const redirectURL = getRedirectUrl();
    if (redirectURL) {
      // get the stashed state with origin information
      // use it to reconstruct redirect for oauth
      // the state is the entire URL of the origin and includes the redirect_uri in a param
      // if authenticating from a RP
      const state = params.get('state');
      if (state) {
        // we may need to deconstruct the state to access/modify the redirect URL
        const stateParams = new URL(decodeURIComponent(state)).searchParams;
        const redirect = stateParams.get('redirect_uri');
        // if the state contains a redirect_uri, we need to redirect to RP
        // otherwise we redirect internally
        if (redirect) {
          hardNavigate(redirect);
        } else {
          // general redirect to settings for non-RP
          // currently, redirect to /settings fails with an "unauthenticated" error from GQL
          // and redirects to /signin (on backbone) where ThirdPArty Auth successfully
          // navigates to /settings
          navigate('/settings');
        }
      }
    }
  };

  // auth params are received from the third party auth provider
  // and are required to verify the account
  const getAuthParams = () => {
    const code = params.get('code');
    const providerFromParams = params.get('provider');
    let provider: AUTH_PROVIDER | undefined;
    if (providerFromParams === 'apple') {
      provider = AUTH_PROVIDER.APPLE;
    } else {
      provider = AUTH_PROVIDER.GOOGLE;
    }

    return { code, provider };
  };

  async function verifyOAuthResponseAndSignIn() {
    const { code, provider } = getAuthParams();

    if (code && provider) {
      try {
        // Verify and link the third party account to FxA. Note, this
        // will create a new FxA account if one does not exist.
        // The response contains a session token that can be used
        // to sign the user in to FxA or to complete an Oauth flow.
        const linkedAccount: LinkedAccountData =
          await account.verifyAccountThirdParty(
            code,
            provider,
            undefined,
            queryParamsToMetricsContext(
              flowQueryParams as unknown as Record<string, string>
            )
          );

        completeSignIn(linkedAccount);
      } catch (error) {
        // TODO add error handling
      }
    } else {
      // TODO validate what should happen if we hit this page
      // without the required auth params to verify the account
      hardNavigate('/');
    }
  }

  useEffect(() => {
    verifyOAuthResponseAndSignIn();
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
