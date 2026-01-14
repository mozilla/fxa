/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { NavigationOptions, SigninLocationState } from './interfaces';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  useSession,
  isOAuthIntegration,
  isOAuthNativeIntegration,
  useAuthClient,
  isOAuthWebIntegration,
} from '../../models';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import { navigate } from '@reach/router';
import { hardNavigate } from 'fxa-react/lib/utils';
import { currentAccount, discardSessionToken } from '../../lib/cache';
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

    // after accountProfile data is retrieved we must check verified status
    const { details } = await authClient.sessionStatus(sessionToken);
    const sessionVerified = details.sessionVerified;
    const emailVerified = details.accountEmailVerified;

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

    const storedLocalAccount = currentAccount();

    return {
      data: {
        verificationMethod,
        verificationReason,
        // Because the cached signin was a success, we know 'uid' exists
        uid: storedLocalAccount!.uid,
        sessionVerified,
        emailVerified,
        // Return TOTP status for components that need it
        totpIsActive,
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
    integration.isSync() || integration.isFirefoxNonSync();
  const wantsTwoStepAuthentication =
    isOAuthWebIntegration(integration) &&
    integration.wantsTwoStepAuthentication();
  const wantsKeys = integration.wantsKeys();

  // If this is an AAL upgrade, the user was redirected from Settings to enter TOTP.
  // RP redirects won't get into this state since they'll be taken to the RP and
  // never Settings. This flow doesn't need Sync web channel messages or care about
  // skipping navigating either because if a Sync user is inside Settings, we probably
  // don't have the oauth query parameters required to begin a sign-in flow
  // anyway. Just take all users back to /settings.
  if (navigationOptions.isSessionAALUpgrade) {
    navigate('/settings');
    return { error: undefined };
  }

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

  // When a session is unverified, we need to redirect to the appropriate page depending on status of
  // the account and the integration being used.
  // There are 3 types of unverified sessions:
  // A. User has 2FA and hasn't entered their code yet
  // B. User has requested scoped keys (Sync flow) and needs to enter an OTP code
  // C. User hasn't logged in in a while, or other heiruistics determined by auth-server
  //
  // The following cases are handled:
  // 1. Users that don't have a verified _email_ always get redirected to confirm signup
  // 2. Users with type A session always get redirected to confirm TOTP
  // 3. Users with type B session always get redirected to confirm email
  // 4. Users with type C session going through an RP flow that requires two-step authentication
  //    always get redirected to confirm email, before setting up TOTP
  // 5. Users with type C session going through a normal RP redirect flow will be allowed to
  //    continue onward without getting prompted for a code, unless the RP is in `servicesWithEmailVerification`.
  //    If they try to use Settings with this session later, they will be prompted then.
  // 6. WebIntegrations (ie Settings) are always redirected to confirm email
  // 7. Users that are forced to change their password always get redirected to confirm email
  const isFullyVerified =
    navigationOptions.signinData.emailVerified &&
    navigationOptions.signinData.sessionVerified;

  if (!isFullyVerified) {
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

    if (
      navigationOptions.signinData.verificationReason ===
        VerificationReasons.SIGN_UP ||
      navigationOptions.signinData.verificationMethod ===
        VerificationMethods.TOTP_2FA ||
      navigationOptions.signinData.verificationReason ===
        VerificationReasons.CHANGE_PASSWORD ||
      navigationOptions.isServiceWithEmailVerification ||
      wantsTwoStepAuthentication ||
      wantsKeys
    ) {
      performNavigation({ to, locationState });
      return { error: undefined };
    }

    // Check if this is a standard OAuth web flow, not a NativeOAuth flow or settings flow
    // if so return to RP, they don't need to have a verified session
    if (isOAuthWebIntegration(integration)) {
      const { to, locationState, shouldHardNavigate, error } =
        await getOAuthNavigationTarget(navigationOptions);
      if (error) {
        return { error };
      }
      if (to) {
        performNavigation({
          to,
          locationState,
          shouldHardNavigate,
          replace: true,
        });
      }
      return { error: undefined };
    }

    if (navigationOptions.performNavigation !== false) {
      performNavigation({ to, locationState });
    }
    return { error: undefined };
  }

  // Account and session are verified
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
  // otherwise oauth/authorization endpoint throws an "unconfirmed session" error.
  // The only exception to this is the type C unverified session noted above.
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
      // If this is a Sync (with password) sign-in, the scoped keys will be bundled
      // with the 'code'.
      // If this is a third party auth sign-in prior to setting a password,
      // the oauthLogin will be deferred until after the password is set.
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
      emailVerified,
      sessionVerified,
      verificationMethod,
      verificationReason,
    },
    showInlineRecoveryKeySetup,
    isSignInWithThirdPartyAuth,
    origin,
  } = navigationOptions;
  return {
    email,
    uid,
    sessionToken,
    emailVerified,
    sessionVerified,
    verificationMethod,
    verificationReason,
    showInlineRecoveryKeySetup,
    isSignInWithThirdPartyAuth,
    origin,
  };
};

function sendFxaLogin(navigationOptions: NavigationOptions) {
  const isOAuth = isOAuthIntegration(navigationOptions.integration);
  const isFullyVerified =
    navigationOptions.signinData.emailVerified &&
    navigationOptions.signinData.sessionVerified;

  firefox.fxaLogin({
    email: navigationOptions.email,
    sessionToken: navigationOptions.signinData.sessionToken,
    uid: navigationOptions.signinData.uid,
    verified: isFullyVerified,
    // Do not send these values if OAuth. Mobile doesn't care about this message, and
    // sending these values can cause intermittent sync disconnect issues in oauth desktop.
    ...(!isOAuth && {
      // keyFetchToken and unwrapBKey should always exist if Sync integration
      keyFetchToken: navigationOptions.signinData.keyFetchToken,
      unwrapBKey: navigationOptions.unwrapBKey,
    }),
    services: navigationOptions.integration.getWebChannelServices(
      navigationOptions.syncEngines
    ),
  });
}

const getUnverifiedNavigationTarget = (
  navigationOptions: NavigationOptions
) => {
  const { verificationMethod, verificationReason } =
    navigationOptions.signinData;
  const { queryParams } = navigationOptions;

  const getUnverifiedNavTo = () => {
    if (verificationMethod === VerificationMethods.TOTP_2FA) {
      return `/signin_totp_code${queryParams || ''}`;
    }

    if (
      // Note that now that we explicitely return 'emailVerified', we may
      // not even need this verificationReason check.
      verificationReason === VerificationReasons.SIGN_UP ||
      !navigationOptions.signinData.emailVerified
    ) {
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
    navigationOptions.isSignInWithThirdPartyAuth &&
    navigationOptions.integration.isSync()
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
      // If user already has TOTP enabled, send them to enter their code instead of setup
      const hasTotp =
        locationState.verificationMethod === VerificationMethods.TOTP_2FA;
      return {
        to: hasTotp
          ? `/signin_totp_code${navigationOptions.queryParams || ''}`
          : `/inline_totp_setup${navigationOptions.queryParams || ''}`,
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
  } else if (navigationOptions.integration.isFirefoxNonSync()) {
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
  // When location state isn't passed, reach-router still gives us an object
  // that contains a 'key', e.g. { key: 123456 }
  // So check for a required key in signin state and if it exists then use it.
  // Otherwise, pull from local storage.
  return locationState && locationState.sessionToken
    ? locationState
    : getStoredAccountInfo();
}

// When SigninLocationState is not available from the router state,
// this method can be used to check local storage
function getStoredAccountInfo(): SigninLocationState | null {
  const { email, sessionToken, uid, verified } = currentAccount() || {};
  if (email && sessionToken && uid && verified !== undefined) {
    // Storage, and Sync web channel messages, have a combined 'verified' field, which
    // we've left combined for now, for backwards compatibility.
    return {
      email,
      sessionToken,
      uid,
      emailVerified: verified,
      sessionVerified: verified,
    };
  }
  return null;
}

/**
 * Sends `can_link_account` with email and UID and handles navigation if cancelled.
 */
export async function ensureCanLinkAcountOrRedirect({
  email,
  uid,
  ftlMsgResolver,
  navigateWithQuery,
}: {
  email: string;
  uid?: hexstring;
  ftlMsgResolver: FtlMsgResolver;
  navigateWithQuery: ReturnType<typeof useNavigateWithQuery>;
}): Promise<boolean> {
  const { ok } = await firefox.fxaCanLinkAccount({
    email,
    uid,
  });
  if (!ok) {
    // User cancelled the login, redirect back to Index with error banner.
    // Prefill the email with this account to prevent a redirect to '/signin'
    // so they can see the error and decide what to do.
    navigateWithQuery('/', {
      replace: true,
      state: {
        localizedErrorFromLocationState: ftlMsgResolver.getMsg(
          'auth-error-1001',
          'Login attempt cancelled'
        ),
        prefillEmail: email,
      },
    });
  }
  return ok;
}
