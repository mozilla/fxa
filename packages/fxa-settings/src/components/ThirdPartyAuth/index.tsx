/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef, FormEventHandler, useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';

import { ReactComponent as GoogleLogo } from './google-logo.svg';
import { ReactComponent as AppleLogo } from './apple-logo.svg';

import { useConfig } from '../../models';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { useMetrics } from '../../lib/metrics';
import GleanMetrics from '../../lib/glean';

export type ThirdPartyAuthProps = {
  onContinueWithGoogle?: FormEventHandler<HTMLFormElement>;
  onContinueWithApple?: FormEventHandler<HTMLFormElement>;
  showSeparator?: boolean;
  viewName?: string;
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
  viewName = 'unknown',
}: ThirdPartyAuthProps) => {
  const config = useConfig();

  useEffect(() => {
    // If the separator is shown, the user has set a password
    if (!showSeparator) {
      GleanMetrics.thirdPartyAuth.viewWithNoPasswordSet();
    }
  }, [showSeparator]);

  return (
    <>
      <div className="flex flex-col">
        {showSeparator && (
          <>
            <div className="text-sm flex items-center justify-center my-6">
              <div className="flex-1 h-px bg-grey-300 divide-x"></div>
              <FtlMsg id="third-party-auth-options-or">
                <div className="mx-4 text-base text-grey-300 font-extralight">
                  or
                </div>
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
              state: getState(),
              scope: 'openid email profile',
              responseType: 'code',
              accessType: 'offline',
              prompt: 'consent',
              viewName,
              onSubmit: onContinueWithGoogle,
              buttonText: (
                <>
                  <GoogleLogo />
                  <FtlMsg id="continue-with-google-button">
                    <p className="pe-4">Continue with Google</p>
                  </FtlMsg>
                </>
              ),
            }}
          />
          <ThirdPartySignInForm
            {...{
              party: 'apple',
              ...config.appleAuthConfig,
              state: getState(),
              scope: 'email',
              responseType: 'code id_token',
              accessType: 'offline',
              prompt: 'consent',
              viewName,
              responseMode: 'form_post',
              onSubmit: onContinueWithApple,
              buttonText: (
                <>
                  <AppleLogo />
                  <FtlMsg id="continue-with-apple-button">
                    <p className="pe-4">Continue with Apple</p>
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
  viewName,
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
  viewName?: string;
}) => {
  const { logViewEventOnce } = useMetrics();
  const stateRef = useRef<HTMLInputElement>(null);

  async function onClick() {
    logViewEventOnce(`flow.${party}`, 'oauth-start');

    switch (`${party}-${viewName}`) {
      case 'google-index':
        GleanMetrics.emailFirst.googleOauthStart();
        break;
      case 'apple-index':
        GleanMetrics.emailFirst.appleOauthStart();
        break;
      case 'google-signin':
        GleanMetrics.thirdPartyAuth.startGoogleAuthFromLogin();
        break;
      case 'apple-signin':
        GleanMetrics.thirdPartyAuth.startAppleAuthFromLogin();
        break;
      case 'google-signup':
        GleanMetrics.thirdPartyAuth.startGoogleAuthFromReg();
        break;
      case 'apple-signup':
        GleanMetrics.thirdPartyAuth.startAppleAuthFromReg();
        break;
    }

    // wait for all the Glean events to be sent before the page unloads
    await GleanMetrics.isDone();

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
        className="w-full px-2 mt-2 justify-center text-black bg-transparent border-grey-300 border hover:border-black rounded-lg text-md text-center inline-flex items-center"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </form>
  );
};

function deleteParams(searchParams: URLSearchParams, paramsToDelete: string[]) {
  paramsToDelete.forEach((param) => searchParams.delete(param));
  return searchParams;
}

function getState() {
  // We stash originating location in the state oauth param
  // because we will need it to use it to reconstruct the redirect URL for RP
  const params = new URLSearchParams(window.location.search);
  // we won't need these params that are used for internal backbone/react navigation
  const modifiedParams = deleteParams(params, [
    'deeplink',
    'email',
    'emailStatusChecked',
    'forceExperiment',
    'forceExperimentGroup',
    'showReactApp',
  ]);
  const state = encodeURIComponent(
    `${window.location.origin}${
      window.location.pathname
    }?${modifiedParams.toString()}`
  );
  return state;
}

export default ThirdPartyAuth;
