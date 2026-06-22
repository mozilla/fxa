/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { NavigationOptions, SigninLocationState } from './interfaces';
import type { SetPasswordLocationState } from '../PostVerify/SetPassword/interfaces';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  useSession,
  isOAuthIntegration,
  isOAuthNativeIntegration,
  useAuthClient,
  isOAuthWebIntegration,
} from '../../models';
import { isSendTabEntrypoint } from '../../lib/utilities';
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
import config from '../../lib/config';
import { funnelReducer } from '../../lib/auth-machine/funnel';
import { routeFor } from '../../lib/auth-machine/route-adapter';
import { isAuthStateMachineEnabled } from '../../lib/auth-machine/flag';
import type { AuthContext } from '../../lib/auth-machine/types';

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

export type PairOrigin = NonNullable<SigninLocationState['origin']>;

interface SyncNavigateOptions {
  showInlineRecoveryKeySetup?: boolean;
  isSignInWithThirdPartyAuth?: boolean;
  showSignupConfirmedSync?: boolean;
  syncHidePromoAfterLogin?: boolean;
  signupSuccess?: boolean;
  origin?: PairOrigin;
}

export function getSyncNavigate(
  queryParams: string,
  {
    showInlineRecoveryKeySetup,
    isSignInWithThirdPartyAuth,
    showSignupConfirmedSync,
    syncHidePromoAfterLogin,
    signupSuccess,
    origin,
  }: SyncNavigateOptions = {}
): {
  to: string;
  shouldHardNavigate: boolean;
  locationState?: Pick<SigninLocationState, 'origin'> &
    Pick<SetPasswordLocationState, 'passwordCreationReason'>;
} {
  const searchParams = new URLSearchParams(queryParams);

  if (isSignInWithThirdPartyAuth) {
    return {
      to: `/post_verify/set_password?${searchParams}`,
      shouldHardNavigate: false,
      // Explicit so the destination page doesn't have to infer the flow from
      // a missing field. Mirrors the explicit reason set by the OTP and
      // passkey callers in SigninPasswordlessCode and signin-flow.
      locationState: { passwordCreationReason: 'third_party_auth' },
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

  // Backbone-era callers may pass `signupSuccess: true` instead of
  // `origin: 'signup'` — honor both. Otherwise fall back to 'signin'.
  const pairOrigin: PairOrigin = signupSuccess
    ? 'signup'
    : (origin ?? 'signin');

  // TODO: adjust this once `pairRoutes` rollout is 100% and Backbone /pair is retired.
  // At that point /pair is always React and we can always soft-nav with
  // location state — no config check, no query params needed.
  if (config.showReactApp?.pairRoutes) {
    const to = searchParams.toString() ? `/pair?${searchParams}` : '/pair';
    return {
      to,
      shouldHardNavigate: false,
      locationState: { origin: pairOrigin },
    };
  }

  searchParams.set('showSuccessMessage', 'true');
  if (signupSuccess) {
    searchParams.set('signupSuccess', 'true');
  }
  if (origin === 'post-verify-set-password') {
    searchParams.set('passwordCreated', 'true');
  }
  return {
    to: `/pair?${searchParams}`,
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

/**
 * Owns navigation for non-OAuth, OAuth-web, and OAuth-native sign-ins when the
 * authStateMachine flag is on (config flag, or a ?authStateMachine=true|false URL
 * override). Covers plain Web, Sync/Firefox-non-sync web-channel integrations,
 * OAuth web (RP) integrations, and OAuth native (Sync desktop/mobile,
 * Firefox-non-sync). Pairing integrations are isOAuthIntegration but neither web
 * nor native, so they stay on the legacy path, along with redirectTo, AAL
 * upgrades, and forced password changes.
 */
function machineOwnsNavigation(o: NavigationOptions): boolean {
  const enabled = isAuthStateMachineEnabled(
    o.queryParams,
    config.featureFlags?.authStateMachine === true
  );
  if (!enabled) return false;
  const i = o.integration;
  return (
    (!isOAuthIntegration(i) ||
      isOAuthWebIntegration(i) ||
      isOAuthNativeIntegration(i)) &&
    !o.redirectTo &&
    !o.isSessionAALUpgrade &&
    o.signinData.verificationReason !== VerificationReasons.CHANGE_PASSWORD
  );
}

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

  // Check CMS feature flags to determine if we should hide promos, the
  // default is to navigate to settings. Gated on isSync() so this is a no-op
  // for plain Web and OAuth. Applied before the machine branch so both the
  // machine and legacy getNonOAuthNavigationTarget see the mutated options.
  const cmsInfo = integration?.getCmsInfo();
  if (
    cmsInfo?.shared.featureFlags?.syncHidePromoAfterLogin &&
    integration.isSync()
  ) {
    navigationOptions.showInlineRecoveryKeySetup = false;
    navigationOptions.showSignupConfirmedSync = false;
    navigationOptions.syncHidePromoAfterLogin = true;
  }

  // Send Tab entrypoints skip intermediate pages (inline recovery key, signup
  // confirmed sync) and go directly to the /pair choice screen.
  if (
    isSendTabEntrypoint(integration.data?.entrypoint) &&
    integration.isSync()
  ) {
    navigationOptions.showInlineRecoveryKeySetup = false;
    navigationOptions.showSignupConfirmedSync = false;
  }

  if (machineOwnsNavigation(navigationOptions)) {
    const { signinData, accountHasTotp } = navigationOptions;
    const ctx: AuthContext = {
      emailVerified: signinData.emailVerified,
      sessionVerified: signinData.sessionVerified,
      verificationMethod: signinData.verificationMethod,
      verificationReason: signinData.verificationReason,
      accountHasTotp: accountHasTotp ?? false,
      // Remaining AuthContext facts are not read by the post-signin router.
      hasRecoveryPhone: false,
      hasPassword: true,
      hasLinkedAccount: false,
      hasCachedSession: false,
      passwordlessSupported: false,
      isOAuth: false,
      isOAuthWeb: false,
      isOAuthNative: false,
      isSync: false,
      isWebChannelIntegration: false,
      supportsKeysOptionalLogin: false,
      requiresKeys: false,
      wantsKeysIfPasswordEntered: false,
      wantsLogin: false,
      clientInfoLoadFailed: false,
    };

    const { state } = funnelReducer(
      'verifying.router',
      {
        type: 'SIGNIN_OK',
        emailVerified: signinData.emailVerified,
        sessionVerified: signinData.sessionVerified,
        verificationMethod: signinData.verificationMethod,
        verificationReason: signinData.verificationReason,
      },
      ctx
    );
    const decision = routeFor(state);
    if ('to' in decision) {
      const { queryParams } = navigationOptions;
      const isOAuth = isOAuthIntegration(integration);
      const isWebChannel =
        integration.isSync() || integration.isFirefoxNonSync();
      const isFullyVerified =
        signinData.emailVerified && signinData.sessionVerified;

      // Verified: the machine routes to finalizing.handoff (/settings). For
      // web-channel this is not the real destination — Sync/Firefox-non-sync
      // resolve through getNonOAuthNavigationTarget (getSyncNavigate). OAuth web
      // resolves through getOAuthNavigationTarget (RP redirect). Plain Web keeps
      // the existing handoff-to-/settings behavior.
      if (isFullyVerified) {
        // Web-channel sends fxa_login before the OAuth/non-OAuth split, matching
        // legacy. For native Sync (OAuth + web-channel) this must fire before
        // OAuth resolution and the subsequent fxaOAuthLogin. OAuth web is not
        // web-channel so this stays inert there.
        if (isWebChannel && navigationOptions.handleFxaLogin === true) {
          sendFxaLogin(navigationOptions);
        }
        // OAuth (web RP or native). Resolve the redirect async, propagate any
        // error, fire firefox.fxaOAuthLogin for native, then navigate when not
        // suppressed. Mirrors the legacy verified-OAuth block exactly.
        if (isOAuth) {
          const target = await getOAuthNavigationTarget(navigationOptions);
          if (target.error) {
            return { error: target.error };
          }
          if (
            isOAuthNativeIntegration(integration) &&
            navigationOptions.handleFxaOAuthLogin === true &&
            target.oauthData
          ) {
            firefox.fxaOAuthLogin({
              action: 'signin',
              code: target.oauthData.code,
              redirect: target.oauthData.redirect,
              state: target.oauthData.state,
              scope: target.oauthData.scope,
            });
          }
          if (navigationOptions.performNavigation !== false) {
            if (target.to === '/post_verify/service_welcome') {
              navigate(target.to, {
                state: { origin: 'signin' },
                replace: true,
              });
            } else if (target.to) {
              performNavigation({
                to: target.to,
                locationState: target.locationState,
                shouldHardNavigate: target.shouldHardNavigate,
                replace: true,
              });
            }
          }
          return { error: undefined };
        }
        if (isWebChannel) {
          // sendFxaLogin fires above regardless; legacy gates the actual
          // navigation on performNavigation but always returns afterward.
          if (navigationOptions.performNavigation !== false) {
            const { to, locationState, shouldHardNavigate } =
              await getNonOAuthNavigationTarget(navigationOptions);
            performNavigation({
              to,
              locationState,
              shouldHardNavigate,
              replace: navigationOptions.origin === 'post-verify-set-password',
            });
          }
          return { error: undefined };
        }
        performNavigation({
          to: `${decision.to}${queryParams || ''}`,
          locationState: createSigninLocationState(navigationOptions),
        });
        return { error: undefined };
      }

      // Unverified: the machine routes to a verify page (/signin_token_code or
      // /signin_totp_code). For web-channel, fire fxa_login before navigating,
      // matching legacy. Skip it when the next page is signin_totp_code to avoid
      // sending a `verified: false` message twice.
      const to = `${decision.to}${queryParams || ''}`;
      if (
        isWebChannel &&
        navigationOptions.handleFxaLogin === true &&
        !to.includes('signin_totp_code')
      ) {
        sendFxaLogin(navigationOptions);
      }
      // Mirror legacy's unverified gating: navigate immediately for the
      // mustVerify cases, otherwise honor performNavigation. Applies to plain
      // Web, web-channel, and OAuth web. wantsTwoStepAuthentication is
      // OAuth-web-only; include it so an AAL2 RP forces verification before the
      // type-C skip below, matching legacy.
      const mustVerify =
        signinData.verificationReason === VerificationReasons.SIGN_UP ||
        signinData.verificationMethod === VerificationMethods.TOTP_2FA ||
        signinData.verificationReason === VerificationReasons.CHANGE_PASSWORD ||
        navigationOptions.isServiceWithEmailVerification === true ||
        (isOAuthWebIntegration(integration) &&
          integration.wantsTwoStepAuthentication()) ||
        integration.wantsKeys();

      // OAuth web "type C" skip-verification path: when not a mustVerify case,
      // an OAuth web RP may take the user onward without a verified session.
      // Mirror the legacy unverified OAuth-web branch exactly (no
      // performNavigation guard around the navigate).
      if (!mustVerify && isOAuthWebIntegration(integration)) {
        const target = await getOAuthNavigationTarget(navigationOptions);
        if (target.error) {
          return { error: target.error };
        }
        if (target.to) {
          performNavigation({
            to: target.to,
            locationState: target.locationState,
            shouldHardNavigate: target.shouldHardNavigate,
            replace: true,
          });
        }
        return { error: undefined };
      }

      if (mustVerify || navigationOptions.performNavigation !== false) {
        performNavigation({
          to,
          locationState: createSigninLocationState(navigationOptions),
        });
      }
      return { error: undefined };
    }
    // delegate/stay (e.g. unverified email → confirm_signup, a later slice):
    // fall through to the unchanged legacy navigation below.
  }

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
      performNavigation({
        to,
        locationState,
        shouldHardNavigate,
        replace: navigationOptions.origin === 'post-verify-set-password',
      });
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
        scope: oauthData.scope,
      });
    }
    if (navigationOptions.performNavigation !== false) {
      if (to === '/post_verify/service_welcome') {
        navigate(to, { state: { origin: 'signin' }, replace: true });
      } else {
        performNavigation({
          to,
          locationState,
          shouldHardNavigate,
          replace: true,
        });
      }
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
    isPasswordlessOtpSignin,
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
    isPasswordlessOtpSignin,
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
    origin,
  } = navigationOptions;
  if (integration.isSync()) {
    const syncNav = getSyncNavigate(queryParams, {
      showInlineRecoveryKeySetup,
      isSignInWithThirdPartyAuth,
      showSignupConfirmedSync,
      origin,
    });
    const locationState = createSigninLocationState(navigationOptions);
    return {
      ...syncNav,
      locationState: { ...locationState, ...(syncNav.locationState ?? {}) },
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

  // Passwordless (third-party-auth) sign-ins that need keys must set a password
  // first. For Sync this is always the case; for non-Sync Firefox clients that
  // want keys it only applies when the browser hasn't decoupled Sync.
  // Returning here, before `finishOAuthFlowHandler` runs, ensures no keyless
  // `oauthData` is produced and no premature fxaOAuthLogin fires.
  if (
    navigationOptions.isSignInWithThirdPartyAuth &&
    navigationOptions.integration.requiresPasswordForLogin(
      navigationOptions.supportsKeysOptionalLogin
    )
  ) {
    const syncNav = getSyncNavigate(navigationOptions.queryParams, {
      showInlineRecoveryKeySetup: locationState.showInlineRecoveryKeySetup,
      isSignInWithThirdPartyAuth: navigationOptions.isSignInWithThirdPartyAuth,
      showSignupConfirmedSync: navigationOptions.showSignupConfirmedSync,
      syncHidePromoAfterLogin: navigationOptions.syncHidePromoAfterLogin,
      origin: navigationOptions.origin,
    });
    return {
      ...syncNav,
      locationState: { ...locationState, ...(syncNav.locationState ?? {}) },
    };
  }

  // A passkey/passwordless session is session-AAL2 but has no account 2FA, so
  // an AAL2 RP (AMO) loops unless we force TOTP enrollment when none is set.
  if (
    isOAuthWebIntegration(navigationOptions.integration) &&
    navigationOptions.integration.wantsTwoStepAuthentication() &&
    navigationOptions.accountHasTotp === false
  ) {
    return {
      to: `/inline_totp_setup${navigationOptions.queryParams || ''}`,
      locationState,
    };
  }

  // `scope` is the server-resolved scope per ADR 0049, only forwarded
  // to Firefox via fxaOAuthLogin; ignored otherwise.
  const { error, redirect, code, state, scope } =
    await navigationOptions.finishOAuthFlowHandler(
      navigationOptions.signinData.uid,
      navigationOptions.signinData.sessionToken,
      navigationOptions.signinData.keyFetchToken,
      navigationOptions.unwrapBKey
    );
  if (error) {
    if (
      error.errno === AuthUiErrors.UNVERIFIED_SESSION.errno ||
      error.errno === AuthUiErrors.TOTP_REQUIRED.errno ||
      error.errno === AuthUiErrors.INSUFFICIENT_ACR_VALUES.errno
    ) {
      GleanMetrics.login.error({ event: { reason: error.message } });

      const to = (() => {
        // If the user doesn't have totp, and encountered an unverified_session error, send them
        // to signin_token_code, this is a 'mustVerify' case
        if (
          locationState.verificationMethod !== VerificationMethods.TOTP_2FA &&
          error.errno === AuthUiErrors.UNVERIFIED_SESSION.errno
        ) {
          return `/signin_token_code${navigationOptions.queryParams || ''}`;
        }

        // If user already has TOTP enabled, send them to enter their code instead of setup
        if (locationState.verificationMethod === VerificationMethods.TOTP_2FA) {
          return `/signin_totp_code${navigationOptions.queryParams || ''}`;
        }

        // Otherwise, we are dealing with an RP that requires totp setup. Send them there.
        return `/inline_totp_setup${navigationOptions.queryParams || ''}`;
      })();

      return {
        to,
        locationState,
      };
    }
    return { error };
  }

  if (navigationOptions.integration.isSync()) {
    const syncNav = getSyncNavigate(navigationOptions.queryParams, {
      showInlineRecoveryKeySetup: locationState.showInlineRecoveryKeySetup,
      isSignInWithThirdPartyAuth: navigationOptions.isSignInWithThirdPartyAuth,
      showSignupConfirmedSync: navigationOptions.showSignupConfirmedSync,
      syncHidePromoAfterLogin: navigationOptions.syncHidePromoAfterLogin,
      origin: navigationOptions.origin,
    });
    return {
      ...syncNav,
      oauthData: {
        code,
        redirect,
        state,
        scope,
      },
      locationState: { ...locationState, ...(syncNav.locationState ?? {}) },
    };
  } else if (navigationOptions.integration.isFirefoxNonSync()) {
    return {
      to: navigationOptions.integration.isFirefoxClientServiceVpn()
        ? '/post_verify/service_welcome'
        : '/settings',
      oauthData: {
        code,
        redirect,
        state,
        scope,
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
