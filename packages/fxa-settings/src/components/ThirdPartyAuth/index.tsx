/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

import { ReactComponent as GoogleLogo } from './google-logo.svg';
import { ReactComponent as AppleLogo } from './apple-logo.svg';

import { useAccount, useConfig } from '../../models';
import Storage from '../../lib/storage';
import { AUTH_PROVIDER } from 'fxa-auth-client/browser';

export type ThirdPartyAuthProps = {
  enabled?: boolean;
};

type ThirdPartyAuthSigninParams = {
  authorizationEndpoint: string;
  clientId: string;
  scope: string;
  redirectUri: string;
  responseType: string;
  responseMode?: string;
};

const GOOGLE_SCOPES = 'openid email profile';
const APPLE_SCOPES = 'email';

/**
 * ThirdPartyAuth component
 * A React component that renders Google and Apple third-party authentication buttons.
 * It handles user sign-in with the respective provider when the buttons are clicked.
 */
const ThirdPartyAuth = ({ enabled = false }: ThirdPartyAuthProps) => {
  const config = useConfig();
  const account = useAccount();

  useEffect(() => {
    // TODO: Figure out why `storageData` is not available
    const authParams = Storage.factory('localStorage', window).get(
      'fxa_third_party_params'
    );
    if (authParams) {
      completeSignIn();
    }
  });

  if (!enabled) {
    return null;
  }

  /**
   * signIn - Handles the sign-in process for third-party authentication providers.
   * Creates a form, sets necessary parameters, and submits it to the provider's
   * authorization endpoint.
   *
   * @param {ThirdPartyAuthSigninParams} config - Configuration parameters for the signIn process.
   */
  function signIn(config: ThirdPartyAuthSigninParams) {
    clearStoredParams();

    // We stash originating location in the state oauth param
    // because we will need it to use it to log the user into FxA
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete('deeplink');
    currentParams.set('showReactApp', 'true');

    const state = encodeURIComponent(
      `${window.location.origin}${
        window.location.pathname
      }?${currentParams.toString()}`
    );

    // TODO: We should this in a more React way. The form and hidden inputs should
    // be in their own component. Ref: https://mozilla-hub.atlassian.net/browse/FXA-7319
    const form = window.document.createElement('form');

    form.setAttribute('method', 'GET');
    form.setAttribute('action', config.authorizationEndpoint);

    const params: Record<string, string | undefined> = {
      client_id: config.clientId,
      scope: config.scope,
      redirect_uri: config.redirectUri,
      state,
      access_type: 'offline',
      prompt: 'consent',
      response_type: config.responseType,
      response_mode: config.responseMode,
    };

    for (const [key, value] of Object.entries(params)) {
      if (!value) {
        continue;
      }
      const input = window.document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', key);
      input.setAttribute('value', value);
      form.appendChild(input);
    }

    // To avoid any CORs issues we append the form to the body and submit it.
    window.document.body.appendChild(form);

    form.submit();
  }

  async function completeSignIn() {
    try {
      const authParams = Storage.factory('localStorage', window).get(
        'fxa_third_party_params'
      );
      const code = authParams.code;
      const provider = authParams.provider || AUTH_PROVIDER.GOOGLE;

      // Verify and link the third party account to FxA. Note, this
      // will create a new FxA account if one does not exist.
      await account.verifyAccountThirdParty(code, provider);

      // TODO: The response from above contains a session token
      // which can be used to sign the user in to FxA or used
      // to complete an Oauth flow.
    } catch (error) {
      // Fail silently on errors, this could be some leftover
      // state from a previous attempt.
    }

    clearStoredParams();
  }
  function clearStoredParams() {
    // TODO: Use the correct storage mechanism
    Storage.factory('localStorage', window).remove('fxa_third_party_params');
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="text-sm flex items-center justify-center my-6">
          <div className="flex-1 h-px bg-grey-300 divide-x"></div>
          <FtlMsg id="third-party-auth-options-or">
            <div className="mx-4">Or</div>
          </FtlMsg>
          <div className="flex-1 h-px bg-grey-300 divide-x"></div>
        </div>

        <div className="flex flex-col">
          <button
            type="button"
            className="w-full mt-2 justify-center text-black bg-transparent border-black border hover:border-grey-300 font-medium rounded-lg text-sm text-center inline-flex items-center"
            onClick={() => {
              signIn({
                authorizationEndpoint:
                  config.googleAuthConfig.authorizationEndpoint,
                clientId: config.googleAuthConfig.clientId,
                scope: GOOGLE_SCOPES,
                redirectUri: config.googleAuthConfig.redirectUri,
                responseType: 'code',
              });
            }}
          >
            <GoogleLogo />
            <FtlMsg id="continue-with-google-button">
              Continue with Google
            </FtlMsg>
          </button>

          <button
            type="button"
            className="w-full mt-2 justify-center text-black bg-transparent border-black border hover:border-grey-300 font-medium rounded-lg text-sm text-center inline-flex items-center"
            onClick={() => {
              signIn({
                authorizationEndpoint:
                  config.appleAuthConfig.authorizationEndpoint,
                clientId: config.appleAuthConfig.clientId,
                scope: APPLE_SCOPES,
                redirectUri: config.appleAuthConfig.redirectUri,
                responseType: 'code id_token',
                responseMode: 'form_post',
              });
            }}
          >
            <AppleLogo />
            <FtlMsg id="continue-with-apple-button">Continue with Apple</FtlMsg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ThirdPartyAuth;
