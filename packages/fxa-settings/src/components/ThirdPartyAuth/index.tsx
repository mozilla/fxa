/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useLocalization } from '@fluent/react';

import { ReactComponent as GoogleLogo } from './google-logo-viewbox.svg';
import { ReactComponent as AppleLogo } from './apple-logo-viewbox-white.svg';
import { ReactComponent as AppleLogoBoxBlack } from './apple-logo-cropped-black.svg';
import { ReactComponent as AppleLogoBoxWhite } from './apple-logo-cropped-white.svg';

import { useConfig } from '../../models';
import { ReactElement } from 'react';
import { useMetrics } from '../../lib/metrics';
import GleanMetrics from '../../lib/glean';
import { QueryParams } from '../..';
import BoxButton from '../BoxButton';

export type ThirdPartyAuthVariant = 'icon' | 'box';

export type ThirdPartyAuthProps = {
  onContinueWithGoogle?: () => void;
  onContinueWithApple?: () => void;
  viewName?: string;
  flowQueryParams?: QueryParams;
  variant?: ThirdPartyAuthVariant;
};

/**
 * ThirdPartyAuth component
 * A React component that renders Google and Apple third-party authentication buttons.
 * It handles user sign-in with the respective provider when the buttons are clicked.
 */
const ThirdPartyAuth = ({
  onContinueWithGoogle,
  onContinueWithApple,
  viewName = 'unknown',
  flowQueryParams,
  variant = 'icon',
}: ThirdPartyAuthProps) => {
  const config = useConfig();

  const buttonContainerClassName =
    variant === 'box' ? 'flex flex-col gap-2.5' : 'flex gap-4 justify-center';

  return (
    <div className={buttonContainerClassName}>
      <ThirdPartySignInButton
        {...{
          party: 'google',
          ...config.googleAuthConfig,
          scope: 'openid email profile',
          responseType: 'code',
          accessType: 'offline',
          prompt: 'consent',
          viewName,
          flowQueryParams,
          variant,
          onSubmit: onContinueWithGoogle,
          buttonText: (
            <>
              <GoogleLogo className="w-full h-auto" />
            </>
          ),
        }}
      />
      <ThirdPartySignInButton
        {...{
          party: 'apple',
          ...config.appleAuthConfig,
          scope: 'email',
          responseType: 'code id_token',
          accessType: 'offline',
          prompt: 'consent',
          viewName,
          responseMode: 'form_post',
          flowQueryParams,
          variant,
          onSubmit: onContinueWithApple,
          buttonText: (
            <>
              <AppleLogo className="w-full h-auto" />
            </>
          ),
        }}
      />
    </div>
  );
};

const ThirdPartySignInButton = ({
  party,
  authorizationEndpoint,
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
  flowQueryParams,
  variant = 'icon',
}: {
  party: 'google' | 'apple';
  authorizationEndpoint: string;
  clientId: string;
  scope: string;
  redirectUri: string;
  accessType: string;
  prompt: string;
  responseType: string;
  responseMode?: string;
  buttonText: ReactElement;
  onSubmit?: () => void;
  viewName?: string;
  flowQueryParams?: QueryParams;
  variant?: ThirdPartyAuthVariant;
}) => {
  const { logViewEventOnce } = useMetrics();
  const { l10n } = useLocalization();

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

  const handleClick = useCallback(async () => {
    onSubmit?.();
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
      case 'google-signin-alternative-auth':
        GleanMetrics.login.alternativeAuthGoogleStart();
        break;
      case 'apple-signin-alternative-auth':
        GleanMetrics.login.alternativeAuthAppleStart();
        break;
      case 'google-signup':
        GleanMetrics.thirdPartyAuth.startGoogleAuthFromReg();
        break;
      case 'apple-signup':
        GleanMetrics.thirdPartyAuth.startAppleAuthFromReg();
        break;
    }

    // Wait for all Glean events to be sent before navigating away.
    await GleanMetrics.isDone();

    const params = {
      state: getState(flowQueryParams),
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      access_type: accessType,
      prompt,
      response_type: responseType,
      ...(responseMode ? { response_mode: responseMode } : {}),
    };
    hardNavigate(authorizationEndpoint, params, false, false, 0);
  }, [
    party,
    viewName,
    logViewEventOnce,
    flowQueryParams,
    clientId,
    scope,
    redirectUri,
    accessType,
    prompt,
    responseType,
    responseMode,
    authorizationEndpoint,
    onSubmit,
  ]);

  if (variant === 'box') {
    const labelFtlId =
      party === 'google'
        ? 'continue-with-google-button'
        : 'continue-with-apple-button';
    const labelDefault =
      party === 'google' ? 'Continue with Google' : 'Continue with Apple';

    let leadingIcon: React.ReactNode;
    switch (party) {
      case 'google':
        leadingIcon = <GoogleLogo className="w-6 h-6" />;
        break;
      case 'apple':
        leadingIcon = (
          // In forced-color mode (HCM), the Apple mark opts out of the system palette
          // and gets an opposite-colour chip for contrast.
          <>
            <span className="flex items-center justify-center dark:hidden forced-colors:[forced-color-adjust:none] forced-colors:rounded-full forced-colors:bg-white forced-colors:p-1.5">
              <AppleLogoBoxBlack className="w-6 h-6" />
            </span>
            <span className="hidden items-center justify-center dark:flex forced-colors:[forced-color-adjust:none] forced-colors:rounded-full forced-colors:bg-black forced-colors:p-1.5">
              <AppleLogoBoxWhite className="w-6 h-6" />
            </span>
          </>
        );
        break;
    }

    return (
      <BoxButton
        onClick={handleClick}
        aria-label={getLoginAriaLabel()}
        leadingIcon={leadingIcon}
      >
        <FtlMsg id={labelFtlId}>{labelDefault}</FtlMsg>
      </BoxButton>
    );
  }

  return (
    <button
      type="button"
      className={`w-[60px] h-[60px] p-4 flex items-center justify-center rounded-full border focus-visible-default outline-offset-2
      ${
        party === 'google'
          ? 'bg-[#F9F4F4] border-[#747775] border-[1px]'
          : 'bg-black border-transparent dark:border-grey-300'
      }
      `}
      onClick={handleClick}
      aria-label={getLoginAriaLabel()}
    >
      {buttonText}
    </button>
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
