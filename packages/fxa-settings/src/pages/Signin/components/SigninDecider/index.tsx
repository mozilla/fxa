/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from '@reach/router';
import Signin from '../..';
import SigninCached from '../SigninCached';
import SigninAlternativeAuthOptions from '../SigninAlternativeAuthOptions';
import { isOAuthIntegration, isOAuthWebIntegration } from '../../../../models';
import { UseFxAStatusResult } from '../../../../lib/hooks/useFxAStatus';
import { MozServices } from '../../../../lib/types';
import { useFinishOAuthFlowHandler } from '../../../../lib/oauth/hooks';
import { useNavigateWithQuery } from '../../../../lib/hooks/useNavigateWithQuery';
import type { QueryParams } from '../../../..';
import {
  AvatarResponse,
  BeginSigninHandler,
  CachedSigninHandler,
  SendUnblockEmailHandler,
  SigninIntegration,
} from '../../interfaces';

export interface SigninDeciderProps {
  integration: SigninIntegration;
  serviceName: MozServices;
  email: string;
  beginSigninHandler: BeginSigninHandler;
  cachedSigninHandler: CachedSigninHandler;
  sendUnblockEmailHandler: SendUnblockEmailHandler;
  sessionToken?: hexstring;
  hasLinkedAccount: boolean;
  hasPassword: boolean;
  avatarData: AvatarResponse | undefined;
  avatarLoading: boolean;
  localizedErrorFromLocationState?: string;
  finishOAuthFlowHandler: ReturnType<
    typeof useFinishOAuthFlowHandler
  >['finishOAuthFlowHandler'];
  localizedSuccessBannerHeading?: string;
  localizedSuccessBannerDescription?: string;
  flowQueryParams?: QueryParams;
  useFxAStatusResult: UseFxAStatusResult;
  isSignedIntoFirefox?: boolean;
  setCurrentSplitLayout?: (value: boolean) => void;
  /** Server-reported whether this account supports passwordless (OTP) signin.
   * Drives the redirect to `/signin_passwordless_code` for passwordless users
   * with no cached session. */
  passwordlessSupported?: boolean;
  /** Set in location state when redirecting away from the passwordless flow
   * (e.g. on TOTP_REQUIRED) to break the redirect loop back to passwordless. */
  skipPasswordlessRedirect?: boolean;
}

/**
 * Decides which of the three signin views the user sees and
 * handles SESSION_EXPIRED by flipping to signin with password.
 */
export const SigninDecider = ({
  integration,
  serviceName,
  email,
  beginSigninHandler,
  cachedSigninHandler,
  sendUnblockEmailHandler,
  sessionToken,
  hasLinkedAccount,
  hasPassword,
  avatarData,
  avatarLoading,
  localizedErrorFromLocationState,
  finishOAuthFlowHandler,
  localizedSuccessBannerHeading,
  localizedSuccessBannerDescription,
  flowQueryParams,
  useFxAStatusResult,
  isSignedIntoFirefox,
  setCurrentSplitLayout,
  passwordlessSupported,
  skipPasswordlessRedirect,
}: SigninDeciderProps) => {
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();

  // Tracks whether the cached session is still considered valid. Initialized
  // from `!!sessionToken`; flipped to false by SigninCached when it receives
  // a SESSION_EXPIRED error from the server.
  const [hasCachedSession, setHasCachedSession] =
    useState<boolean>(!!sessionToken);

  const sessionExpiredErrorRef = useRef<string | null>(null);

  const onSessionExpired = useCallback((localizedErrorMessage: string) => {
    sessionExpiredErrorRef.current = localizedErrorMessage;
    setHasCachedSession(false);
  }, []);

  // Passwordless + no-linked-account + no-cached-session has no valid path
  // through any of the three signin views — redirect to the OTP page. Gates
  // on `hasCachedSession` (not the `sessionToken` prop) so SESSION_EXPIRED
  // also routes the user to OTP instead of falling through to a dead-end
  // password input they can't fill. Cached takes precedence on initial
  // render because hasCachedSession starts as `!!sessionToken`.
  const shouldRedirectToPasswordless = !!(
    passwordlessSupported &&
    !hasPassword &&
    !hasLinkedAccount &&
    !hasCachedSession &&
    !skipPasswordlessRedirect
  );

  useEffect(() => {
    if (!shouldRedirectToPasswordless) return;
    const passwordlessRoute = location.pathname.startsWith('/oauth')
      ? '/oauth/signin_passwordless_code'
      : '/signin_passwordless_code';
    navigateWithQuery(passwordlessRoute, {
      state: { email, clientId: integration.getClientId() },
    });
  }, [
    shouldRedirectToPasswordless,
    navigateWithQuery,
    location.pathname,
    email,
    integration,
  ]);

  if (shouldRedirectToPasswordless) {
    return null;
  }

  const isOAuth = isOAuthIntegration(integration);

  // Relay browser service login launched in Firefox desktop 135, and the "keys optional"
  // capability (Sync decoupling) launched in Fx desktop 147, meaning all Relay service users
  // in those Fx versions require a password.
  // This also covers Mobile until Sync is decoupled except for the authorization state below.
  const syncNotDecoupledRequiresPassword =
    !useFxAStatusResult.supportsKeysOptionalLogin &&
    integration.wantsKeysIfPasswordEntered();

  // In Firefox Android 153, Sync is not decoupled, but we need to show cached sign-in
  // for signed-in users (e.g., signed into Sync) that are authorizing VPN.
  const isMobileAuthorizationFlow =
    syncNotDecoupledRequiresPassword &&
    !!isSignedIntoFirefox &&
    integration.isFirefoxMobileClient();

  // Redirect-based RPs (OAuthWeb) that request scoped keys always need a password for key
  // derivation. In practice today, we don't have RPs that need this, but we do support it.
  const redirectRpRequiresKeys =
    isOAuthWebIntegration(integration) && integration.wantsKeys();

  const passwordNeeded =
    !hasCachedSession ||
    integration.requiresKeys() ||
    syncNotDecoupledRequiresPassword ||
    redirectRpRequiresKeys ||
    // The password is forced when the RP requests prompt=login
    (isOAuth && integration.wantsLogin());

  // Do we have a session token, and can we defer the key fetch because sync is decoupled?
  const keysOptional =
    hasCachedSession && useFxAStatusResult.supportsKeysOptionalLogin;

  // Determine whether to show the cached view (no password input). Keys always
  // require a password for derivation, but we can skip it when:
  // - The user is already signed into Firefox (authorization flow) AND the
  //   service doesn't require keys (Sync always requires them), OR
  // - The browser supports "keys optional" (Sync decoupled from other services)
  //
  // Passwordless users always see cached sign-in and are redirected to set a
  // password after signing in, if a password is required (e.g. for Sync).
  const showCached =
    hasCachedSession &&
    (isMobileAuthorizationFlow ||
      !hasPassword ||
      !passwordNeeded ||
      keysOptional);

  if (showCached) {
    return (
      <SigninCached
        {...{
          integration,
          serviceName,
          email,
          sessionToken: sessionToken!,
          cachedSigninHandler,
          hasLinkedAccount,
          hasPassword,
          avatarData,
          avatarLoading,
          localizedErrorFromLocationState,
          finishOAuthFlowHandler,
          localizedSuccessBannerHeading,
          localizedSuccessBannerDescription,
          flowQueryParams,
          isSignedIntoFirefox,
          setCurrentSplitLayout,
          onSessionExpired,
          supportsKeysOptionalLogin:
            useFxAStatusResult.supportsKeysOptionalLogin,
        }}
      />
    );
  }

  // When falling through from cached → another view (SESSION_EXPIRED), surface
  // the carried-over error message as the initial banner. The ref is read
  // once on the child's mount; subsequent re-renders don't reset the child's
  // banner state because each child owns its own useState.
  const initialBannerError =
    sessionExpiredErrorRef.current ?? localizedErrorFromLocationState;

  // Linked-account-passwordless without a cached session. If keys are required
  // users will be taken to "Set password" after signing in.
  if (hasLinkedAccount && !hasPassword) {
    return (
      <SigninAlternativeAuthOptions
        {...{
          integration,
          serviceName,
          email,
          hasLinkedAccount,
          hasPassword,
          avatarData,
          avatarLoading,
          localizedErrorFromLocationState: initialBannerError,
          finishOAuthFlowHandler,
          localizedSuccessBannerHeading,
          localizedSuccessBannerDescription,
          flowQueryParams,
          isSignedIntoFirefox,
          setCurrentSplitLayout,
          supportsKeysOptionalLogin:
            useFxAStatusResult.supportsKeysOptionalLogin,
        }}
      />
    );
  }

  return (
    <Signin
      {...{
        integration,
        serviceName,
        email,
        beginSigninHandler,
        sendUnblockEmailHandler,
        hasLinkedAccount,
        hasPassword,
        avatarData,
        avatarLoading,
        localizedErrorFromLocationState: initialBannerError,
        finishOAuthFlowHandler,
        localizedSuccessBannerHeading,
        localizedSuccessBannerDescription,
        flowQueryParams,
        useFxAStatusResult,
        isSignedIntoFirefox,
        setCurrentSplitLayout,
      }}
    />
  );
};

export default SigninDecider;
