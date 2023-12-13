/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, FormEventHandler } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

import { ReactComponent as GoogleLogo } from './google-logo.svg';
import { ReactComponent as AppleLogo } from './apple-logo.svg';

import { useAccount, useConfig } from '../../models';
import Storage from '../../lib/storage';
import { AUTH_PROVIDER } from 'fxa-auth-client/browser';
import { ReactElement } from 'react-markdown/lib/react-markdown';

export type ThirdPartyAuthProps = {
  onContinueWithGoogle?: FormEventHandler<HTMLFormElement>;
  onContinueWithApple?: FormEventHandler<HTMLFormElement>;
  showSeparator?: boolean;
};

/**
 * ThirdPartyAuth component
 * A React component that renders Google and Apple third-party authentication buttons.
 * It handles user sign-in with the respective provider when the buttons are clicked.
 */
const ThirdPartyAuth = ({
  onContinueWithGoogle,
  onContinueWithApple,
  showSeparator = true,
}: ThirdPartyAuthProps) => {
  const account = useAccount();
  const config = useConfig();

  useEffect(() => {
    // TODO: Figure out why `storageData` is not available
    const authParams = Storage.factory('localStorage', window).get(
      'fxa_third_party_params'
    );
    if (authParams) {
      completeSignIn();
    }
  });

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

  return (
    <>
      <div className="flex flex-col">
        {showSeparator && (
          <>
            <div className="text-sm flex items-center justify-center my-6">
              <div className="flex-1 h-px bg-grey-300 divide-x"></div>
              <FtlMsg id="third-party-auth-options-or">
                <div className="mx-4">Or</div>
              </FtlMsg>
              <div className="flex-1 h-px bg-grey-300 divide-x"></div>
            </div>
          </>
        )}
        <div className="flex flex-col">
          <ThirdPartySignInForm
            {...{
              party: 'google',
              ...config.googleAuthConfig,
              state: '',
              scope: 'openid email profile',
              responseType: 'code',
              accessType: 'offline',
              prompt: 'consent',
              onSubmit: onContinueWithGoogle,
              buttonText: (
                <>
                  <GoogleLogo />
                  <FtlMsg id="continue-with-google-button">
                    Continue with Google
                  </FtlMsg>
                </>
              ),
            }}
          />
          <ThirdPartySignInForm
            {...{
              party: 'apple',
              ...config.appleAuthConfig,
              state: '',
              scope: 'email',
              responseType: 'code id_token',
              accessType: 'offline',
              prompt: 'consent',
              responseMode: 'form_post',
              onSubmit: onContinueWithApple,
              buttonText: (
                <>
                  <AppleLogo />
                  <FtlMsg id="continue-with-apple-button">
                    Continue with Apple
                  </FtlMsg>
                </>
              ),
            }}
          />
        </div>
      </div>
    </>
  );
};

/**
 * Represents the sign in form posted to google third party auth.
 * Note that the innerRef is used by the parent component to trigger
 * a form submission.
 */
const ThirdPartySignInForm = ({
  party,
  authorizationEndpoint,
  state,
  clientId,
  scope,
  redirectUri,
  accessType,
  prompt,
  responseType,
  responseMode,
  buttonText,
  onSubmit,
}: {
  party: 'google' | 'apple';
  authorizationEndpoint: string;
  state: string;
  clientId: string;
  scope: string;
  redirectUri: string;
  accessType: string;
  prompt: string;
  responseType: string;
  responseMode?: string;
  buttonText: ReactElement;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}) => {
  const stateRef = useRef<HTMLInputElement>(null);

  function onClick() {
    clearStoredParams();
    stateRef.current!.value = getState();
  }

  if (onSubmit === undefined) {
    onSubmit = () => true;
  }

  return (
    <form action={authorizationEndpoint} method="GET" onSubmit={onSubmit}>
      <input
        data-testid={`${party}-signin-form-state`}
        ref={stateRef}
        type="hidden"
        name="state"
        value={state}
      />
      <input type="hidden" name="client_id" value={clientId} />
      <input type="hidden" name="scope" value={scope} />
      <input type="hidden" name="redirect_uri" value={redirectUri} />
      <input type="hidden" name="access_type" value={accessType} />
      <input type="hidden" name="prompt" value={prompt} />
      <input type="hidden" name="response_type" value={responseType} />
      {responseMode && (
        <input type="hidden" name="response_mode" value={responseMode} />
      )}

      <button
        type="submit"
        className="w-full mt-2 justify-center text-black bg-transparent border-black border hover:border-grey-300 font-medium rounded-lg text-sm text-center inline-flex items-center"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </form>
  );
};

function getState() {
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
  return state;
}

function clearStoredParams() {
  // TODO: Use the correct storage mechanism
  Storage.factory('localStorage', window).remove('fxa_third_party_params');
}

export default ThirdPartyAuth;
