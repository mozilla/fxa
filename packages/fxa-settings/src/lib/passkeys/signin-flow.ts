/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsgResolver } from 'fxa-react/lib/utils';

import type { BannerProps } from '../../components/Banner/interfaces';
import GleanMetrics from '../glean';
import { NavigationOptions } from '../../pages/Signin/interfaces';
import { resolveServiceOrClientId } from '../../models/integrations/utils';
import type { PasskeySignInGleanReason } from './webauthn-errors';
import { PASSKEY_SUPPORT_URL, PASSKEY_TROUBLESHOOT_URL } from './constants';

/**
 * Sign-in surface the user clicked the passkey button on. Drives Glean event
 * routing (email vs login category) and the `reason` extra on
 * `passkey_enter_password.*` events.
 */
export type PasskeySignInSurface =
  | 'emailfirst'
  | 'login'
  | 'login_otp'
  | 'alternative_auth';

/** Surface vocabulary used in passkey metric reasons (see {@link toPasskeyMetricsSurface}). */
export type PasskeyMetricsSurface =
  | 'emailfirst'
  | 'signin'
  | 'otplogin'
  | 'alternative_auth';

type SurfaceGlean = {
  submit: () => void;
  submitFrontendError: (reason: PasskeySignInGleanReason) => void;
  submitSuccess: () => void;
};

/** One row per surface: metrics vocabulary and the Glean emitters. */
export const PASSKEY_SIGNIN_SURFACES: Record<
  PasskeySignInSurface,
  { metrics: PasskeyMetricsSurface; glean: SurfaceGlean }
> = {
  emailfirst: {
    metrics: 'emailfirst',
    glean: {
      submit: () => GleanMetrics.emailFirst.passkeySubmit(),
      submitFrontendError: (reason) =>
        GleanMetrics.emailFirst.passkeySubmitFrontendError({
          event: { reason },
        }),
      submitSuccess: () => GleanMetrics.emailFirst.passkeySubmitSuccess(),
    },
  },
  login: {
    metrics: 'signin',
    glean: {
      submit: () => GleanMetrics.login.passkeySubmit(),
      submitFrontendError: (reason) =>
        GleanMetrics.login.passkeySubmitFrontendError({ event: { reason } }),
      submitSuccess: () => GleanMetrics.login.passkeySubmitSuccess(),
    },
  },
  login_otp: {
    metrics: 'otplogin',
    glean: {
      submit: () => GleanMetrics.passwordlessLogin.passkeySubmit(),
      submitFrontendError: (reason) =>
        GleanMetrics.passwordlessLogin.passkeySubmitFrontendError({
          event: { reason },
        }),
      submitSuccess: () =>
        GleanMetrics.passwordlessLogin.passkeySubmitSuccess(),
    },
  },
  alternative_auth: {
    metrics: 'alternative_auth',
    glean: {
      submit: () => GleanMetrics.login.alternativeAuthPasskeySubmit(),
      submitFrontendError: (reason) =>
        GleanMetrics.login.alternativeAuthPasskeySubmitFrontendError({
          event: { reason },
        }),
      submitSuccess: () =>
        GleanMetrics.login.alternativeAuthPasskeySubmitSuccess(),
    },
  },
};

export const toPasskeyMetricsSurface = (
  surface: PasskeySignInSurface
): PasskeyMetricsSurface => PASSKEY_SIGNIN_SURFACES[surface].metrics;

export type PasskeyAuthSuccessOutcome =
  | 'nopassword'
  | 'withpassword'
  | 'createdpassword';

export type PasskeyAuthSuccessReason =
  | 'emailfirst_nopassword'
  | 'emailfirst_withpassword'
  | 'emailfirst_createdpassword'
  | 'signin_nopassword'
  | 'signin_withpassword'
  | 'signin_createdpassword'
  // `otplogin` and `alternative_auth` are no-password surfaces: they never
  // reach the existing-password fallback, so `*_withpassword` is unreachable.
  | 'otplogin_nopassword'
  | 'otplogin_createdpassword'
  | 'alternative_auth_nopassword'
  | 'alternative_auth_createdpassword';

export const buildPasskeyAuthSuccessReason = (
  prefix: PasskeyMetricsSurface,
  outcome: PasskeyAuthSuccessOutcome
): PasskeyAuthSuccessReason =>
  `${prefix}_${outcome}` as PasskeyAuthSuccessReason;

/**
 * Reuses handleNavigation's integration type (SigninIntegration) because
 * the hook forwards `integration` straight through to it. Narrowing this
 * to just the methods the hook calls would require handleNavigation to
 * have its own structural integration type — a moderate refactor across
 * every handleNavigation caller. Accepted tradeoff for now.
 */
export type PasskeySignInIntegration = NavigationOptions['integration'];

/**
 * Resolves the `service` sent with a passkey authentication request, forcing
 * `sync` for any Sync integration. Mobile Firefox omits the `service=sync` URL
 * param, so `getService()` is undefined and `resolveServiceOrClientId` would
 * otherwise resolve to the client id — losing the Sync attribution the server
 * needs for its post-signin notifications.
 */
export function resolvePasskeyService(
  integration: PasskeySignInIntegration
): string | undefined {
  if (integration.isSync()) {
    return 'sync';
  }
  return resolveServiceOrClientId(integration);
}

/** Banner state the hook returns; the page renders it with `<Banner {...banner} />`. */
export type PasskeySignInBanner = Pick<
  BannerProps,
  'type' | 'content' | 'link'
>;

export function passkeyErrorBanner(
  ftl: FtlMsgResolver,
  ftlId: string,
  fallback: string
): PasskeySignInBanner {
  return {
    type: 'error',
    content: { localizedHeading: ftl.getMsg(ftlId, fallback) },
  };
}

export function passkeyUnexpectedBanner(
  ftl: FtlMsgResolver
): PasskeySignInBanner {
  return passkeyErrorBanner(
    ftl,
    'passkey-authentication-error-unexpected',
    'Something went wrong. Try again or choose another sign-in method.'
  );
}

// Shown when a passkey sign-in is cancelled (dismissed prompt, no passkey on
// this device, or the authenticator can't satisfy the request). Points to
// help plus another sign-in option.
export function passkeyTroubleBanner(
  ftl: FtlMsgResolver,
  surface: PasskeySignInSurface
): PasskeySignInBanner {
  return {
    type: 'warning',
    content: {
      localizedHeading: ftl.getMsg(
        'passkey-authentication-trouble-heading',
        'Couldn’t sign in with a passkey'
      ),
      localizedDescription: ftl.getMsg(
        'passkey-authentication-trouble-description',
        'Try again or use another sign-in option.'
      ),
    },
    link: {
      url:
        surface === 'emailfirst'
          ? PASSKEY_SUPPORT_URL
          : PASSKEY_TROUBLESHOOT_URL,
      localizedText: ftl.getMsg(
        'passkey-authentication-trouble-link',
        'How to use passkeys'
      ),
      onClick: () => {
        try {
          GleanMetrics.passkey.getHelpLinkClick({
            event: { reason: toPasskeyMetricsSurface(surface) },
          });
        } catch {
          // A metrics failure must never block the help link.
        }
      },
    },
  };
}

// A timed-out ceremony is transient — its own message, warning style, retry.
export function passkeyTimeoutBanner(ftl: FtlMsgResolver): PasskeySignInBanner {
  return {
    type: 'warning',
    content: {
      localizedHeading: ftl.getMsg(
        'passkey-authentication-error-timeout-v2',
        'Passkey sign-in timed out. Try again.'
      ),
    },
  };
}
