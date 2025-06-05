/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import {
  NavigationOptions,
  RecoveryEmailStatusResponse,
  SigninLocationState,
} from './interfaces';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  useSession,
  isOAuthIntegration,
  isOAuthNativeIntegration,
  useAuthClient,
} from '../../models';
import { navigate } from '@reach/router';
import { hardNavigate } from 'fxa-react/lib/utils';
import { currentAccount, discardSessionToken } from '../../lib/cache';
import firefox from '../../lib/channels/firefox';
import { AuthError, OAuthError } from '../../lib/oauth';
import GleanMetrics from '../../lib/glean';
import { OAuthData } from '../../lib/oauth/hooks';
import { InMemoryCache } from '@apollo/client';
import AuthenticationMethods from '../../constants/authentication-methods';

interface NavigationTarget {
  to: string;
  locationState?: SigninLocationState;
  shouldHardNavigate?: boolean;
  oauthData?: OAuthData;
  error?: undefined;
  replace?: boolean;
}
interface NavigationTargetError {
  to?: undefined;
  locationState?: undefined;
  shouldHardNavigate?: undefined;
  oauthData?: undefined;
  error: AuthError;
}

export function getSyncNavigate(
  queryParams: string,
  showInlineRecoveryKeySetup?: boolean,
  isSignInWithThirdPartyAuth?: boolean
) {
  const searchParams = new URLSearchParams(queryParams);

  if (isSignInWithThirdPartyAuth) {
    return {
      to: `/post_verify/third_party_auth/set_password?${searchParams}`,
      shouldHardNavigate: false,
    };
  }

  if (showInlineRecoveryKeySetup) {
    return {
      to: `/inline_recovery_key_setup?${searchParams}`,
      shouldHardNavigate: false,
    };
  }

  searchParams.set('showSuccessMessage', 'true');
  return {
    to: `/pair?${searchParams}`,
    // TODO: don't hard navigate once Pair is converted to React
    shouldHardNavigate: true,
  };
}

export const cachedSignIn = async (
  sessionToken: string,
  authClient: ReturnType<typeof useAuthClient>,
  cache: InMemoryCache,
  session: ReturnType<typeof useSession>
) => {
  try {
    const {
      authenticationMethods, authenticatorAssuranceLevel
    }: { authenticationMethods: AuthenticationMethods[], authenticatorAssuranceLevel: number } =
      await authClient.accountProfile(sessionToken);

    const totpIsActive = authenticationMethods.includes(
      AuthenticationMethods.OTP
    );
    if (totpIsActive) {
      // Cache this for subsequent requests
      cache.modify({
        id: cache.identify({ __typename: 'Account' }),
        fields: {
          totp() {
            return { exists: true, verified: true };
          },
        },
      });
    }

    // after accountProfile data is retrieved we must check verified status
    // TODO: FXA-9177 can we use the useSession hook here? Or update Apollo Cache
    const {
      verified,
      sessionVerified,
      emailVerified,
    }: RecoveryEmailStatusResponse = await authClient.recoveryEmailStatus(
      sessionToken
    );

    let verificationMethod;
    let verificationReason;

    if (totpIsActive) {
      if (authenticatorAssuranceLevel >=2 ) {
        // user is a valid and verified 2FA session, don't set any verification method
      } else {
        // user has 2FA enabled but is in a non-2FA session; it shouldn't happen
        // in practice, redirect them to log in again
        throw new OAuthError('PROMPT_NONE_NOT_SIGNED_IN');
      }
    } else if (!sessionVerified) {
      verificationMethod = VerificationMethods.EMAIL_OTP;
      verificationReason = emailVerified
        ? VerificationReasons.SIGN_IN
        : VerificationReasons.SIGN_UP;

      if (!verified && session.sendVerificationCode) {
        await session.sendVerificationCode();
      }
    }

    const storedLocalAccount = currentAccount();

    return {
      data: {
        verificationMethod,
        verificationReason,
        verified,
        // Because the cached signin was a success, we know 'uid' exists
        uid: storedLocalAccount!.uid,
        sessionVerified, // might not need
        emailVerified, // might not need
      },
    };
  } catch (error) {
    // If 'invalid token' is received from profile server, it means
    // the session token has expired
    const { errno } = error as AuthUiError;
    if (errno === AuthUiErrors.INVALID_TOKEN.errno) {
      discardSessionToken();
      return { error: AuthUiErrors.SESSION_EXPIRED };
    }
    return { error };
  }
};

// In Backbone and React, 'confirm_signup_code' and 'signin_token_code' send key
// and token data up to Sync with fxa_login and then the CAD/pair page (currently
// Backbone) completes the signin with fxa_status.
//
// In Backbone happy path signin (session is verified after signin) as well as
// Backbone 'signin_totp_code' and `signin_unblock`, we send key/token data up on
// the CAD/pair page itself with an fxa_status message. We don't want to do this with
// React signin until CAD/pair is converted to React because we'd need to pass this
// data back to Backbone. This means temporarily we need to send the sync data up
// _before_ we hard navigate to CAD/pair in these flows.
export async function handleNavigation(navigationOptions: NavigationOptions) {
  const { integration } = navigationOptions;
  const isOAuth = isOAuthIntegration(integration);
  const isWebChannelIntegration =
    integration.isSync() || integration.isDesktopRelay();

  if (!navigationOptions.signinData.verified) {
    const { to, locationState } =
      getUnverifiedNavigationTarget(navigationOptions);
    if (
      isWebChannelIntegration &&
      navigationOptions.handleFxaLogin === true &&
      // If the _next page_ is `signin_totp_code`, we don't want to send this
      // because we end up sending it twice with the first message containing
      // `verified: false`, causing a Sync sign-in issue (see FXA-9837).
      !to?.includes('signin_totp_code')
    ) {
      sendFxaLogin(navigationOptions);
    }
    performNavigation({ to, locationState });
    return { error: undefined };
  }

  if (
    navigationOptions.signinData.verificationReason ===
    VerificationReasons.CHANGE_PASSWORD
  ) {
    // TODO in FXA-6653: remove hardNavigate when this route is converted to React
    hardNavigate('/post_verify/password/force_password_change', {}, true);
    return { error: undefined };
  }

  if (isWebChannelIntegration && navigationOptions.handleFxaLogin === true) {
    // This _must_ be sent before fxaOAuthLogin for Desktop OAuth flow.
    // Mobile doesn't care about this message (see FXA-10388)
    sendFxaLogin(navigationOptions);
  }

  if (!isOAuth) {
    const { to, locationState, shouldHardNavigate } =
      await getNonOAuthNavigationTarget(navigationOptions);
    performNavigation({ to, locationState, shouldHardNavigate });
    return { error: undefined };
  }

  // Note that OAuth redirect can only be obtained when the session is verified,
  // otherwise oauth/authorization endpoint throws an "unconfirmed session" error
  if (isOAuth) {
    const { to, locationState, oauthData, shouldHardNavigate, error } =
      await getOAuthNavigationTarget(navigationOptions);

    if (error) {
      return { error };
    }
    if (
      isOAuthNativeIntegration(integration) &&
      navigationOptions.handleFxaOAuthLogin === true &&
      oauthData
    ) {
      firefox.fxaOAuthLogin({
        action: 'signin',
        code: oauthData.code,
        redirect: oauthData.redirect,
        state: oauthData.state,
      });
    }
    performNavigation({ to, locationState, shouldHardNavigate, replace: true });
  }

  return { error: undefined };
}

const createSigninLocationState = (
  navigationOptions: NavigationOptions
): SigninLocationState => {
  const {
    email,
    signinData: {
      uid,
      sessionToken,
      verified,
      verificationMethod,
      verificationReason,
    },
    showInlineRecoveryKeySetup,
  } = navigationOptions;
  return {
    email,
    uid,
    sessionToken,
    verified,
    verificationMethod,
    verificationReason,
    showInlineRecoveryKeySetup,
  };
};

function sendFxaLogin(navigationOptions: NavigationOptions) {
  const isOAuth = isOAuthIntegration(navigationOptions.integration);
  firefox.fxaLogin({
    email: navigationOptions.email,
    sessionToken: navigationOptions.signinData.sessionToken,
    uid: navigationOptions.signinData.uid,
    verified: navigationOptions.signinData.verified,
    // Do not send these values if OAuth. Mobile doesn't care about this message, and
    // sending these values can cause intermittent sync disconnect issues in oauth desktop.
    ...(!isOAuth && {
      // keyFetchToken and unwrapBKey should always exist if Sync integration
      keyFetchToken: navigationOptions.signinData.keyFetchToken,
      unwrapBKey: navigationOptions.unwrapBKey,
    }),
    services: navigationOptions.integration.isDesktopRelay()
      ? { relay: {} }
      : { sync: navigationOptions.syncEngines || {} },
  });
}

const getUnverifiedNavigationTarget = (
  navigationOptions: NavigationOptions
) => {
  const { verificationReason, verificationMethod } =
    navigationOptions.signinData;
  const { integration, queryParams } = navigationOptions;
  const isOAuth = isOAuthIntegration(integration);

  const getUnverifiedNavTo = () => {
    // TODO in FXA-9177 Consider storing state in Apollo cache instead of location state
    if (
      ((verificationReason === VerificationReasons.SIGN_IN ||
        verificationReason === VerificationReasons.CHANGE_PASSWORD) &&
        verificationMethod === VerificationMethods.TOTP_2FA) ||
      (isOAuth && integration.wantsTwoStepAuthentication())
    ) {
      return `/signin_totp_code${queryParams || ''}`;
    } else if (verificationReason === VerificationReasons.SIGN_UP) {
      return `/confirm_signup_code${queryParams || ''}`;
    }
    return `/signin_token_code${queryParams || ''}`;
  };

  return {
    to: getUnverifiedNavTo(),
    locationState: createSigninLocationState(navigationOptions),
  };
};

function performNavigation({
  to,
  shouldHardNavigate = false,
  locationState,
  replace = false,
}: Pick<NavigationTarget, 'to' | 'locationState' | 'shouldHardNavigate' | 'replace'>) {
  if (shouldHardNavigate) {
    // Hard navigate to RP, or (temp until CAD/pair is Reactified)
    hardNavigate(to, undefined, undefined, replace);
  } else if (locationState) {
    navigate(to, { state: locationState, replace });
  } else {
    navigate(to, { replace });
  }
}

const getNonOAuthNavigationTarget = async (
  navigationOptions: NavigationOptions
): Promise<NavigationTarget> => {
  const {
    integration,
    queryParams,
    showInlineRecoveryKeySetup,
    redirectTo,
    isSignInWithThirdPartyAuth,
  } = navigationOptions;
  if (integration.isSync()) {
    return {
      ...getSyncNavigate(
        queryParams,
        showInlineRecoveryKeySetup,
        isSignInWithThirdPartyAuth
      ),
    };
  }
  // We don't want a hard navigate to `/settings` as it
  // clears out the initially created integration.
  if (redirectTo && redirectTo !== '/settings') {
    return { to: redirectTo, shouldHardNavigate: true };
  }
  return { to: '/settings' };
};

const getOAuthNavigationTarget = async (
  navigationOptions: NavigationOptions
): Promise<NavigationTarget | NavigationTargetError> => {
  const locationState = createSigninLocationState(navigationOptions);

  if (
    navigationOptions.integration.isSync() &&
    navigationOptions.isSignInWithThirdPartyAuth
  ) {
    return {
      ...getSyncNavigate(
        navigationOptions.queryParams,
        locationState.showInlineRecoveryKeySetup,
        navigationOptions.isSignInWithThirdPartyAuth
      ),
      locationState,
    };
  }

  const { error, redirect, code, state } =
    await navigationOptions.finishOAuthFlowHandler(
      navigationOptions.signinData.uid,
      navigationOptions.signinData.sessionToken,
      navigationOptions.signinData.keyFetchToken,
      navigationOptions.unwrapBKey
    );
  if (error) {
    if (
      error.errno === AuthUiErrors.TOTP_REQUIRED.errno ||
      error.errno === AuthUiErrors.INSUFFICIENT_ACR_VALUES.errno
    ) {
      GleanMetrics.login.error({ event: { reason: error.message } });
      return {
        to: `/inline_totp_setup${navigationOptions.queryParams || ''}`,
        locationState,
      };
    }
    return { error };
  }

  if (navigationOptions.integration.isSync()) {
    return {
      ...getSyncNavigate(
        navigationOptions.queryParams,
        locationState.showInlineRecoveryKeySetup,
        navigationOptions.isSignInWithThirdPartyAuth
      ),
      oauthData: {
        code,
        redirect,
        state,
      },
      locationState,
    };
  } else if (navigationOptions.integration.isDesktopRelay()) {
    return {
      to: '/settings',
      oauthData: {
        code,
        redirect,
        state,
      },
    };
  }
  return { to: redirect, shouldHardNavigate: true };
};

export function getSigninState(
  locationState?: SigninLocationState
): SigninLocationState | null {
  return locationState && Object.keys(locationState).length > 0
    ? locationState
    : getStoredAccountInfo();
}

// When SigninLocationState is not available from the router state,
// this method can be used to check local storage
function getStoredAccountInfo() {
  const { email, sessionToken, uid, verified } = currentAccount() || {};
  if (email && sessionToken && uid && verified !== undefined) {
    return {
      email,
      sessionToken,
      uid,
      verified,
    };
  }
  return null;
}
