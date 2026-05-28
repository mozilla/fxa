/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import type AuthClient from 'fxa-auth-client/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';

import Banner from '../../components/Banner';
import { AuthUiErrors } from '../auth-errors/auth-errors';
import GleanMetrics from '../glean';
import { useNavigateWithQuery } from '../hooks/useNavigateWithQuery';
import { FinishOAuthFlowHandler } from '../oauth/hooks';
import { storeAccountData } from '../storage-utils';
import { NavigationOptions } from '../../pages/Signin/interfaces';
import {
  ensureCanLinkAcountOrRedirect,
  handleNavigation,
} from '../../pages/Signin/utils';
import {
  getCredential,
  handleWebAuthnError,
  isWebAuthnLevel3Supported,
  type PublicKeyCredentialJSON,
} from './';
import type { PasskeySignInGleanReason } from './webauthn-errors';

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

export type PasskeyFallbackSurface = 'emailfirst' | 'login';

/**
 * Fallback page (`/signin_passkey_fallback`) collapses surfaces to two.
 * 'login_otp' is reached only via the email-first flow. 'alternative_auth'
 * is shown to linked-passwordless users who have no password by definition,
 * so the existing-password fallback path is unreachable for them — but the
 * mapping must stay exhaustive; group with 'login' as a defensive default.
 */
const surfaceToFallbackReason = (
  surface: PasskeySignInSurface
): PasskeyFallbackSurface =>
  surface === 'login' || surface === 'alternative_auth'
    ? 'login'
    : 'emailfirst';

/**
 * Maps the surface enum to the two-prefix space used by the
 * `passkey.auth_success` reason codes (`emailfirst_*` vs `signin_*`). The
 * passwordless OTP code page is part of the email-first journey, so it
 * groups with `emailfirst`. The alternative-auth page rolls up under
 * `signin` alongside the regular /signin page. Note the prefix is `signin`,
 * not `login`, to match the schema Ipsita agreed in the ticket comments.
 */
const surfaceToAuthSuccessPrefix = (
  surface: PasskeySignInSurface
): 'emailfirst' | 'signin' =>
  surface === 'login' || surface === 'alternative_auth'
    ? 'signin'
    : 'emailfirst';

export type PasskeyAuthSuccessOutcome =
  | 'nopassword'
  | 'withpassword'
  | 'createdpassword';

export type PasskeyAuthSuccessReason =
  | 'emailfirst_nopassword'
  | 'emailfirst_withpassword'
  | 'emailfirst_createdpassword'
  | 'signin_nopassword'
  | 'signin_withpassword';

export const buildPasskeyAuthSuccessReason = (
  surface: PasskeySignInSurface,
  outcome: PasskeyAuthSuccessOutcome
): PasskeyAuthSuccessReason =>
  `${surfaceToAuthSuccessPrefix(surface)}_${outcome}` as PasskeyAuthSuccessReason;

interface PasskeySurfaceGleanEvents {
  submit: () => void;
  submitFrontendError: (reason: PasskeySignInGleanReason) => void;
  submitSuccess: () => void;
}

const gleanEventsForSurface = (
  surface: PasskeySignInSurface
): PasskeySurfaceGleanEvents => {
  switch (surface) {
    case 'emailfirst':
      return {
        submit: () => GleanMetrics.emailFirst.passkeySubmit(),
        submitFrontendError: (reason) =>
          GleanMetrics.emailFirst.passkeySubmitFrontendError({
            event: { reason },
          }),
        submitSuccess: () => GleanMetrics.emailFirst.passkeySubmitSuccess(),
      };
    case 'login':
      return {
        submit: () => GleanMetrics.login.passkeySubmit(),
        submitFrontendError: (reason) =>
          GleanMetrics.login.passkeySubmitFrontendError({ event: { reason } }),
        submitSuccess: () => GleanMetrics.login.passkeySubmitSuccess(),
      };
    case 'login_otp':
      return {
        submit: () => GleanMetrics.passwordlessLogin.passkeySubmit(),
        submitFrontendError: (reason) =>
          GleanMetrics.passwordlessLogin.passkeySubmitFrontendError({
            event: { reason },
          }),
        submitSuccess: () =>
          GleanMetrics.passwordlessLogin.passkeySubmitSuccess(),
      };
    case 'alternative_auth':
      return {
        submit: () => GleanMetrics.login.alternativeAuthPasskeySubmit(),
        submitFrontendError: (reason) =>
          GleanMetrics.login.alternativeAuthPasskeySubmitFrontendError({
            event: { reason },
          }),
        submitSuccess: () =>
          GleanMetrics.login.alternativeAuthPasskeySubmitSuccess(),
      };
    default: {
      // Compile-time exhaustiveness check: a new value of
      // PasskeySignInSurface must be handled above before TypeScript will
      // accept it here.
      const _exhaustive: never = surface;
      throw new Error(`Unhandled PasskeySignInSurface: ${_exhaustive}`);
    }
  }
};

/**
 * Reuses handleNavigation's integration type (SigninIntegration) because
 * the hook forwards `integration` straight through to it. Narrowing this
 * to just the methods the hook calls would require handleNavigation to
 * have its own structural integration type — a moderate refactor across
 * every handleNavigation caller. Accepted tradeoff for now.
 */
export type PasskeySignInIntegration = NavigationOptions['integration'];

/** Pick<> so tests can pass minimal mocks without `as any`. */
export type PasskeySignInAuthClient = Pick<
  AuthClient,
  'beginPasskeyAuthentication' | 'completePasskeyAuthentication' | 'account'
>;

/**
 * Shape of an entry in `authClient.account(...)`'s `emails` array. The
 * auth-client return type isn't formally typed; this local interface
 * documents the subset we depend on.
 */
type AccountEmail = {
  email: string;
  isPrimary: boolean;
  verified: boolean;
};

export interface UsePasskeySignInArgs {
  integration: PasskeySignInIntegration;
  authClient: PasskeySignInAuthClient;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  ftlMsgResolver: FtlMsgResolver;
  navigateWithQuery: ReturnType<typeof useNavigateWithQuery>;
  queryParams: string;
  surface: PasskeySignInSurface;
}

export interface UsePasskeySignInResult {
  isLoading: boolean;
  errorBanner: React.ReactNode | undefined;
  onClick: () => Promise<void>;
}

export function usePasskeySignIn({
  integration,
  authClient,
  finishOAuthFlowHandler,
  ftlMsgResolver,
  navigateWithQuery,
  queryParams,
  surface,
}: UsePasskeySignInArgs): UsePasskeySignInResult {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const inFlight = useRef(false);

  const errorBanner = useMemo<React.ReactNode | undefined>(
    () =>
      errorMessage
        ? React.createElement(Banner, {
            type: 'error',
            content: { localizedHeading: errorMessage },
          })
        : undefined,
    [errorMessage]
  );

  const setLocalizedError = useCallback(
    (ftlId: string, fallback: string) => {
      setErrorMessage(ftlMsgResolver.getMsg(ftlId, fallback));
    },
    [ftlMsgResolver]
  );

  const onClick = useCallback(async () => {
    if (inFlight.current) {
      return;
    }
    setErrorMessage(undefined);
    const gleanEvents = gleanEventsForSurface(surface);

    // Button stays visible even without support — the user may have a passkey
    // on another device and deserves an explicit error rather than a silently
    // missing option.
    if (!isWebAuthnLevel3Supported()) {
      gleanEvents.submitFrontendError('not_supported');
      setLocalizedError(
        'passkey-authentication-error-not-supported-v2',
        'Your browser or device doesn’t support passkeys.'
      );
      return;
    }

    // Defensive: webchannel-driven OAuth may leave this component mounted on
    // success; without finish() the button stays stuck in loading.
    const finish = () => {
      inFlight.current = false;
      setIsLoading(false);
    };
    const setUnexpectedError = () =>
      setLocalizedError(
        'passkey-authentication-error-unexpected',
        'Something went wrong. Try again or choose another sign-in method.'
      );

    inFlight.current = true;
    setIsLoading(true);
    gleanEvents.submit();

    try {
      // Discoverable credentials only — the Signin page's email field is
      // intentionally ignored. The browser surfaces all credentials for the
      // RP and the user picks one.
      const challengeOptions = await authClient.beginPasskeyAuthentication();

      // Isolated try/catch so a network-layer TypeError (e.g. fetch failure)
      // from surrounding auth-client calls can't be miscategorised as a
      // WebAuthn error.
      let credential: PublicKeyCredentialJSON;
      try {
        credential = await getCredential(challengeOptions);
      } catch (err) {
        if (err instanceof DOMException || err instanceof TypeError) {
          const categorized = handleWebAuthnError(
            err,
            'authentication',
            Sentry.captureException
          );
          gleanEvents.submitFrontendError(categorized.gleanReason);
          setLocalizedError(categorized.ftlId, categorized.fallbackText);
          finish();
          return;
        }
        throw err;
      }

      const service = integration.getService();
      const completion = await authClient.completePasskeyAuthentication(
        credential,
        challengeOptions.challenge,
        service ? { service } : {}
      );

      gleanEvents.submitSuccess();

      // Server response intentionally omits email — fetch it here. Fail
      // closed if missing; downstream code (storeAccountData, can_link_account
      // WebChannel, handleNavigation) would silently corrupt with undefined.
      // The server returns canonical (lowercased) email; safe to forward as-is.
      const account = await authClient.account(completion.sessionToken);
      const email = account?.emails?.find(
        (e: AccountEmail) => e.isPrimary
      )?.email;
      if (typeof email !== 'string') {
        throw new Error('Authenticated account response missing email');
      }

      // Runs before storeAccountData so a dismissed merge dialog doesn't
      // leave a ghost session that Index would re-evaluate as signed-in.
      if (integration.isSync() || integration.isFirefoxNonSync()) {
        const canLink = await ensureCanLinkAcountOrRedirect({
          email,
          uid: completion.uid,
          ftlMsgResolver,
          navigateWithQuery,
        });
        if (!canLink) {
          // Defensive finish() — ensureCanLinkAcountOrRedirect navigates
          // away, but Index → Index with prefill keeps this component
          // mounted and the button needs to be clickable again.
          finish();
          return;
        }
      }

      // Mirrors Signin/container.tsx's persist-after-sign-in pattern.
      storeAccountData({
        email,
        uid: completion.uid,
        lastLogin: Date.now(),
        sessionToken: completion.sessionToken,
        verified: completion.verified,
        sessionVerified: completion.verified,
        hasPassword: completion.hasPassword,
      });

      if (completion.requiresPasswordForSync) {
        // Sync still needs a password to derive keys
        const fallbackPath = completion.hasPassword
          ? '/signin_passkey_fallback'
          : '/post_verify/set_password';
        // Thread state so the destination page can tag Glean events with
        // the passkey context. `passkeySurface` drives both the
        // `passkey_enter_password.*` reason on the fallback page and the
        // `passkey.auth_success` reason fired from each terminal success
        // (existing-password reauth on the fallback page,
        // newly-created-password on the set-password page).
        // `passwordCreationReason: 'passkey'` drives the
        // `post_verify_set_password.*` reason on the set-password page.
        navigateWithQuery(fallbackPath, {
          state: completion.hasPassword
            ? { passkeySurface: surfaceToFallbackReason(surface) }
            : {
                passwordCreationReason: 'passkey' as const,
                passkeySurface: surfaceToFallbackReason(surface),
              },
        });
        return;
      }

      const accountHasTotp = !!account?.totp?.verified;

      // Delegate to handleNavigation (same path as password sign-in).
      const { error: navError } = await handleNavigation({
        email,
        signinData: {
          uid: completion.uid,
          sessionToken: completion.sessionToken,
          // Passkey assertion is AAL2; email was verified at registration.
          emailVerified: true,
          sessionVerified: completion.verified,
          verificationMethod: undefined,
          verificationReason: undefined,
        },
        integration,
        finishOAuthFlowHandler,
        queryParams,
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
        performNavigation: true,
        isPasskeySession: true,
        accountHasTotp,
      });

      if (navError) {
        Sentry.captureException(navError);
        setUnexpectedError();
      } else {
        // Terminal success for the no-password-needed branch: WebAuthn
        // ceremony verified, no Sync password step required, navigation
        // completed cleanly. Fire the consolidated success event with the
        // appropriate `<surface>_nopassword` reason for Looker funnels.
        GleanMetrics.passkey.authSuccess({
          event: {
            reason: buildPasskeyAuthSuccessReason(surface, 'nopassword'),
          },
        });
      }
      finish();
    } catch (err) {
      const errno = (err as { errno?: number })?.errno;
      if (errno === AuthUiErrors.PASSKEY_NOT_FOUND.errno) {
        // Expected divergence between server state and authenticator state
        // (e.g. user deleted the passkey elsewhere). Not Sentry-worthy.
        gleanEvents.submitFrontendError('no_passkey_found');
        setLocalizedError(
          'passkey-authentication-error-not-found',
          'Passkey not recognized. Use another sign-in method.'
        );
      } else {
        // Drop upstream err.message — backend shapes may include identifiers
        // (uid, email) we can't enforce from here. errno tag + Sentry stack
        // are enough for triage.
        gleanEvents.submitFrontendError('unexpected');
        Sentry.captureException(new Error('passkey-signin error'), {
          tags: { errno: String(errno ?? 'none') },
        });
        setUnexpectedError();
      }
      finish();
    }
  }, [
    integration,
    authClient,
    finishOAuthFlowHandler,
    ftlMsgResolver,
    navigateWithQuery,
    queryParams,
    setLocalizedError,
    surface,
  ]);

  return { isLoading, errorBanner, onClick };
}
