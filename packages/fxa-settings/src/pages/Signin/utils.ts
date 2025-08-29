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
import {
  accountCache,
  apolloCache,
  MissingCachedAccount,
} from '../../lib/cache';
import firefox from '../../lib/channels/firefox';
import { AuthError } from '../../lib/oauth';
import GleanMetrics from '../../lib/glean';
import { OAuthData } from '../../lib/oauth/hooks';
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

interface SyncNavigateOptions {
  showInlineRecoveryKeySetup?: boolean;
  isSignInWithThirdPartyAuth?: boolean;
  showSignupConfirmedSync?: boolean;
  syncHidePromoAfterLogin?: boolean;
}

export function getSyncNavigate(
  queryParams: string,
  {
    showInlineRecoveryKeySetup,
    isSignInWithThirdPartyAuth,
    showSignupConfirmedSync,
    syncHidePromoAfterLogin,
  }: SyncNavigateOptions = {}
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

  if (showSignupConfirmedSync) {
    return {
      to: `/signup_confirmed_sync?${searchParams}`,
      shouldHardNavigate: false,
    };
  }

  if (syncHidePromoAfterLogin) {
    return {
      to: `/settings?${searchParams}`,
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
  session: ReturnType<typeof useSession>,
  isOauthPromptNone = false
) => {
  try {
    // retrieves the account's authentication methods only
    // authenticatorAssuranceLevel reflects account AAL
    // and does not reflect the token's AAL (==> not useful here)
    const {
      authenticationMethods,
    }: {
      authenticationMethods: AuthenticationMethods[];
    } = await authClient.accountProfile(sessionToken);

    const totpIsActive = authenticationMethods.includes(
      AuthenticationMethods.OTP
    );

    // !!! TBD !!!
    // Is this really enough to make ensure that totp both exists and is verified?
    if (totpIsActive) {
      apolloCache.setAccountTotpStatus(true, true);
    }

    // after accountProfile data is retrieved we must check verified status
    // TODO: FXA-9177 can we use the useSession hook here? Or update Apollo Cache
    const {
      verified,
      sessionVerified,
      emailVerified,
    }: RecoveryEmailStatusResponse = await authClient.recoveryEmailStatus(
      // TODO: It'd be better if we just didn't make a request in this state. We know it'll fail.
      sessionToken
    );

    let verificationMethod;
    let verificationReason;

    if (!emailVerified) {
      verificationReason = VerificationReasons.SIGN_UP;
      verificationMethod = VerificationMethods.EMAIL_OTP;
      !isOauthPromptNone && (await session.sendVerificationCode());
    } else if (!sessionVerified) {
      // we are inferring verification method and verification reason here
      // ideally we would check the server directly to allow for more verification reasons
      verificationReason = VerificationReasons.SIGN_IN;
      if (totpIsActive) {
        verificationMethod = VerificationMethods.TOTP_2FA;
      } else {
        verificationMethod = VerificationMethods.EMAIL_OTP;
        !isOauthPromptNone && (await session.sendVerificationCode());
      }
    }

    const storedLocalAccount = accountCache.getCurrentAccount();

    // The account should exist since sign in was valid! If not, something is very wrong
    // fail fast.
    if (!storedLocalAccount) {
      throw new MissingCachedAccount();
    }

    return {
      data: {
        verificationMethod,
        verificationReason,
        verified,
        uid: storedLocalAccount.uid,
        sessionVerified, // might not need
        emailVerified, // might not need
      },
    };
  } catch (error) {
    // If 'invalid token' is received from profile server, it means
    // the session token has expired
    const { errno } = error as AuthUiError;
    if (errno === AuthUiErrors.INVALID_TOKEN.errno) {
      const account = accountCache.getCurrentAccount();
      if (account) {
        account.sessionToken = undefined;
        accountCache.setAccount(account);
      }
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
    integration.isSync() || integration.isFirefoxClientServiceRelay();

  // Check CMS fleature flags to determine if we should hide promos, the
  // default is to navigate to settings
  const cmsInfo = integration?.getCmsInfo();
  if (
    cmsInfo?.shared.featureFlags?.syncHidePromoAfterLogin &&
    integration.isSync()
  ) {
    navigationOptions.showInlineRecoveryKeySetup = false;
    navigationOptions.showSignupConfirmedSync = false;
    navigationOptions.syncHidePromoAfterLogin = true;
  }

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

    if (navigationOptions.performNavigation !== false) {
      performNavigation({ to, locationState });
    }
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
    if (navigationOptions.performNavigation !== false) {
      const { to, locationState, shouldHardNavigate } =
        await getNonOAuthNavigationTarget(navigationOptions);
      performNavigation({ to, locationState, shouldHardNavigate });
    }
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
    if (navigationOptions.performNavigation !== false) {
      performNavigation({
        to,
        locationState,
        shouldHardNavigate,
        replace: true,
      });
    }
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
    origin,
  } = navigationOptions;
  return {
    email,
    uid,
    sessionToken,
    verified,
    verificationMethod,
    verificationReason,
    showInlineRecoveryKeySetup,
    origin,
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
    services: navigationOptions.integration.isFirefoxClientServiceRelay()
      ? { relay: {} }
      : { sync: navigationOptions.syncEngines || {} },
  });
}

const getUnverifiedNavigationTarget = (
  navigationOptions: NavigationOptions
) => {
  const { verificationReason, verificationMethod } =
    navigationOptions.signinData;
  const { queryParams } = navigationOptions;

  const getUnverifiedNavTo = () => {
    if (verificationMethod === VerificationMethods.TOTP_2FA) {
      return `/signin_totp_code${queryParams || ''}`;
    }

    if (verificationReason === VerificationReasons.SIGN_UP) {
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
}: Pick<
  NavigationTarget,
  'to' | 'locationState' | 'shouldHardNavigate' | 'replace'
>) {
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
    showSignupConfirmedSync,
  } = navigationOptions;
  if (integration.isSync()) {
    return {
      ...getSyncNavigate(queryParams, {
        showInlineRecoveryKeySetup,
        isSignInWithThirdPartyAuth,
        showSignupConfirmedSync,
      }),
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
      ...getSyncNavigate(navigationOptions.queryParams, {
        showInlineRecoveryKeySetup: locationState.showInlineRecoveryKeySetup,
        isSignInWithThirdPartyAuth:
          navigationOptions.isSignInWithThirdPartyAuth,
        showSignupConfirmedSync: navigationOptions.showSignupConfirmedSync,
        syncHidePromoAfterLogin: navigationOptions.syncHidePromoAfterLogin,
      }),
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
      ...getSyncNavigate(navigationOptions.queryParams, {
        showInlineRecoveryKeySetup: locationState.showInlineRecoveryKeySetup,
        isSignInWithThirdPartyAuth:
          navigationOptions.isSignInWithThirdPartyAuth,
        showSignupConfirmedSync: navigationOptions.showSignupConfirmedSync,
        syncHidePromoAfterLogin: navigationOptions.syncHidePromoAfterLogin,
      }),
      oauthData: {
        code,
        redirect,
        state,
      },
      locationState,
    };
  } else if (navigationOptions.integration.isFirefoxClientServiceRelay()) {
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
  const { email, sessionToken, uid, verified } =
    accountCache.getCurrentAccount() || {};
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
