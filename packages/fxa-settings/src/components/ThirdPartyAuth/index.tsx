/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback } from 'react';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useLocalization } from '@fluent/react';

import { ReactComponent as GoogleLogo } from './google-logo-viewbox.svg';
import { ReactComponent as AppleLogoBoxBlack } from './apple-logo-cropped-black.svg';
import { ReactComponent as AppleLogoBoxWhite } from './apple-logo-cropped-white.svg';

import { useConfig } from '../../models';
import { useMetrics } from '../../lib/metrics';
import GleanMetrics from '../../lib/glean';
import { QueryParams } from '../..';
import BoxButton from '../BoxButton';

export type ThirdPartyAuthProps = {
  onContinueWithGoogle?: () => void;
  onContinueWithApple?: () => void;
  viewName?: string;
  flowQueryParams?: QueryParams;
  disabled?: boolean;
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
  disabled = false,
}: ThirdPartyAuthProps) => {
  const config = useConfig();

  return (
    <div className="flex flex-col gap-2.5">
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
          disabled,
          onSubmit: onContinueWithGoogle,
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
          disabled,
          onSubmit: onContinueWithApple,
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
  onSubmit,
  viewName,
  flowQueryParams,
  disabled = false,
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
  onSubmit?: () => void;
  viewName?: string;
  flowQueryParams?: QueryParams;
  disabled?: boolean;
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

  const isGoogle = party === 'google';
  const labelFtlId = isGoogle
    ? 'continue-with-google-button'
    : 'continue-with-apple-button';
  const labelDefault = isGoogle
    ? 'Continue with Google'
    : 'Continue with Apple';
  const leadingIcon = isGoogle ? (
    <GoogleLogo className="w-6 h-6" />
  ) : (
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

  return (
    <BoxButton
      onClick={handleClick}
      aria-label={getLoginAriaLabel()}
      leadingIcon={leadingIcon}
      disabled={disabled}
    >
      <FtlMsg id={labelFtlId}>{labelDefault}</FtlMsg>
    </BoxButton>
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
