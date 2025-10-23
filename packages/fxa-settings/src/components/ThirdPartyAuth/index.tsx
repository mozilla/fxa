/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useLocalization } from '@fluent/react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { FormEventHandler, useCallback, useEffect, useRef } from 'react';

import { ReactComponent as AppleLogo } from './apple-logo-viewbox-white.svg';
import { ReactComponent as GoogleLogo } from './google-logo-viewbox.svg';

import { ReactElement } from 'react-markdown/lib/react-markdown';
import { QueryParams } from '../..';
import GleanMetrics from '../../lib/glean';
import { useMetrics } from '../../lib/metrics';
import { useConfig } from '../../models';

export type ThirdPartyAuthProps = {
  onContinueWithGoogle?: FormEventHandler<HTMLFormElement>;
  onContinueWithApple?: FormEventHandler<HTMLFormElement>;
  showSeparator?: boolean;
  viewName?: string;
  deeplink?: string;
  flowQueryParams?: QueryParams;
  separatorType?: 'or' | 'signInWith';
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
  deeplink,
  flowQueryParams,
  separatorType = 'or',
}: ThirdPartyAuthProps) => {
  const config = useConfig();

  useEffect(() => {
    // If the separator is shown, the user has set a password
    if (!showSeparator) {
      GleanMetrics.thirdPartyAuth.loginNoPwView();
    }
  }, [showSeparator]);

  return (
    <>
      <div className="flex flex-col">
        {showSeparator && (
          <>
            <div className="text-sm flex items-center justify-center my-6">
              <div className="flex-1 h-px bg-grey-300 divide-x"></div>
              {(() => {
                const id =
                  separatorType === 'signInWith'
                    ? 'third-party-auth-options-sign-in-with'
                    : 'third-party-auth-options-or';
                const defaultText =
                  separatorType === 'signInWith' ? 'Sign in with' : 'or';
                return (
                  <FtlMsg id={id}>
                    <div className="mx-4 text-base text-grey-500 font-extralight">
                      {defaultText}
                    </div>
                  </FtlMsg>
                );
              })()}
              <div className="flex-1 h-px bg-grey-300 divide-x"></div>
            </div>
          </>
        )}
        <div className="flex gap-4 justify-center">
          <ThirdPartySignInForm
            {...{
              party: 'google',
              ...config.googleAuthConfig,
              state: getState(flowQueryParams),
              scope: 'openid email profile',
              responseType: 'code',
              accessType: 'offline',
              prompt: 'consent',
              viewName,
              onSubmit: onContinueWithGoogle,
              buttonText: (
                <>
                  <GoogleLogo className="w-full h-auto" />
                </>
              ),
              deeplink,
            }}
          />
          <ThirdPartySignInForm
            {...{
              party: 'apple',
              ...config.appleAuthConfig,
              state: getState(flowQueryParams),
              scope: 'email',
              responseType: 'code id_token',
              accessType: 'offline',
              prompt: 'consent',
              viewName,
              responseMode: 'form_post',
              onSubmit: onContinueWithApple,
              buttonText: (
                <>
                  <AppleLogo className="w-full h-auto" />
                </>
              ),
              deeplink,
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
  deeplink,
  flowQueryParams,
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
  deeplink?: string;
  flowQueryParams?: QueryParams;
}) => {
  const { logViewEventOnce } = useMetrics();
  const { l10n } = useLocalization();
  const stateRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isDeeplinking = deeplink !== undefined;

  const getLoginAriaLabel = () => {
    const labels = {
      google: l10n.getString(
        'continue-with-google-button',
        null,
        'Continue with Google'
      ),
      apple: l10n.getString(
        'continue-with-apple-button',
        null,
        'Continue with Apple'
      ),
    };
    return labels[party];
  };

  const onClick = useCallback(async () => {
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
      case 'google-deeplink':
        GleanMetrics.thirdPartyAuth.googleDeeplink();
        break;
      case 'apple-deeplink':
        GleanMetrics.thirdPartyAuth.appleDeeplink();
        break;
    }

    // wait for all the Glean events to be sent before the page unloads
    await GleanMetrics.isDone();

    if (stateRef.current) {
      stateRef.current.value = getState(flowQueryParams);
    }
  }, [party, stateRef, viewName, logViewEventOnce, flowQueryParams]);

  if (onSubmit === undefined) {
    onSubmit = () => true;
  }

  useEffect(() => {
    if (deeplink && formRef.current) {
      // Only deeplink if this is the correct button
      if (
        (deeplink === 'googleLogin' && party === 'google') ||
        (deeplink === 'appleLogin' && party === 'apple')
      ) {
        onClick();
        formRef.current.submit();
      }
    }
  }, [deeplink, onClick, party]);

  return (
    <form
      action={authorizationEndpoint}
      method="GET"
      onSubmit={onSubmit}
      ref={formRef}
    >
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

      {!isDeeplinking ? (
        <button
          type="submit"
          className={`w-[60px] h-[60px] p-4 flex items-center justify-center rounded-full border focus-visible-default outline-offset-2
          ${
            party === 'google'
              ? 'bg-[#F9F4F4] border-[#747775] border-[1px]'
              : 'bg-black border-transparent'
          }
          `}
          onClick={onClick}
          aria-label={getLoginAriaLabel()}
        >
          {buttonText}
        </button>
      ) : null}
    </form>
  );
};

function deleteParams(searchParams: URLSearchParams, paramsToDelete: string[]) {
  paramsToDelete.forEach((param) => searchParams.delete(param));
  return searchParams;
}

function getState(flowQueryParams: QueryParams | undefined) {
  // We stash the originating location in the state oauth param
  // because we will need it to use it to reconstruct the redirect URL for RP
  const params = new URLSearchParams(window.location.search);

  // Combine flowQueryParams and paramsObject, ensuring all values are strings
  const paramsObject = Object.fromEntries(params.entries());
  const combinedParams = {
    ...paramsObject,
    ...Object.fromEntries(
      Object.entries(flowQueryParams || {}).map(([key, value]) => [
        key,
        String(value),
      ])
    ),
  };

  // Remove unwanted keys
  const filteredParams = deleteParams(new URLSearchParams(combinedParams), [
    'deeplink',
    'email',
    'emailStatusChecked',
    'forceExperiment',
    'forceExperimentGroup',
    'showReactApp',
  ]);
  // we won't need these params that are used for internal backbone/react navigation
  return encodeURIComponent(
    `${window.location.origin}${
      window.location.pathname
    }?${filteredParams.toString()}`
  );
}

export default ThirdPartyAuth;
