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
import { resolveServiceOrClientId } from '../../models/integrations/utils';
import { queryParamsToMetricsContext } from '../metrics';
import { searchParams } from '../utilities';
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

/** Surface vocabulary used in passkey metric reasons (see {@link toPasskeyMetricsSurface}). */
export type PasskeyMetricsSurface =
  | 'emailfirst'
  | 'signin'
  | 'otplogin'
  | 'alternative_auth';

/**
 * Maps each sign-in surface to its passkey metric-reason name: `login` to
 * `signin` and `login_otp` to `otplogin` (to match the agreed schema);
 * `emailfirst` and `alternative_auth` are unchanged.
 */
const toPasskeyMetricsSurface = (
  surface: PasskeySignInSurface
): PasskeyMetricsSurface => {
  switch (surface) {
    case 'login':
      return 'signin';
    case 'login_otp':
      return 'otplogin';
    case 'alternative_auth':
      return 'alternative_auth';
    case 'emailfirst':
      return 'emailfirst';
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unhandled PasskeySignInSurface: ${_exhaustive}`);
    }
  }
};

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

/**
 * Resolves the `service` value sent with a passkey authentication request.
 * Forces `sync` for any Sync integration; everything else uses
 * `resolveServiceOrClientId`. Why force it:
 * - The server decides per credential whether the account password is needed
 *   (phase 1: always, to derive Sync keys; phase 2: not when the passkey
 *   carries a stored key wrap) and needs `service=sync` to make that call.
 * - Mobile Firefox omits the `service=sync` URL param, so `getService()` is
 *   undefined and `resolveServiceOrClientId` would return the client id,
 *   silently skipping that decision.
 */
export function resolvePasskeyService(
  integration: PasskeySignInIntegration
): string | undefined {
  if (integration.isSync()) {
    return 'sync';
  }
  return resolveServiceOrClientId(integration);
}

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

      const serviceForRequest = resolvePasskeyService(integration);
      const metricsContext = queryParamsToMetricsContext(
        searchParams(queryParams) as Record<string, string | undefined>
      );
      const completion = await authClient.completePasskeyAuthentication(
        credential,
        challengeOptions.challenge,
        {
          ...(serviceForRequest ? { service: serviceForRequest } : {}),
          metricsContext,
        }
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
        // Thread the passkey context so the destination page can tag its Glean
        // events with the originating surface.
        navigateWithQuery(fallbackPath, {
          state: completion.hasPassword
            ? { passkeySurface: toPasskeyMetricsSurface(surface) }
            : {
                passwordCreationReason: 'passkey' as const,
                passkeySurface: toPasskeyMetricsSurface(surface),
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
        // On Firefox mobile, the browser finishes sign-in via WebChannel
        // messages; navigating the WebView away would interrupt it.
        performNavigation: !integration.isFirefoxMobileClient(),
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
            reason: buildPasskeyAuthSuccessReason(
              toPasskeyMetricsSurface(surface),
              'nopassword'
            ),
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
