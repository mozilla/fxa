/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { useNavigate } from 'react-router';

import { AuthUiErrors } from '../../auth-errors/auth-errors';
import GleanMetrics from '../../glean';
import { useGleanView } from '../../glean/useGleanView';
import { useMounted } from '../useMounted';
import { useNavigateWithQuery } from '../useNavigateWithQuery';
import { FinishOAuthFlowHandler } from '../../oauth/hooks';
import { handleNavigation } from '../../../pages/Signin/utils';
import { queryParamsToMetricsContext } from '../../metrics';
import type { QueryParams } from '../../..';
import { isWebAuthnSupported } from '../../passkeys';
import { authenticateWithPasskey } from '../../passkeys/signin-passkey-auth';
import { resolveSignedInAccount } from '../../passkeys/signin-account';
import { recoverPasswordlessKb } from '../../passkeys/wrap/recover';
import { useConfig, useSensitiveDataClient } from '../../../models';
import {
  PASSKEY_SIGNIN_SURFACES,
  toPasskeyMetricsSurface,
  buildPasskeyAuthSuccessReason,
  passkeyErrorBanner,
  passkeyUnexpectedBanner,
  shouldRequestWrapMaterial,
  type PasskeySignInAuthClient,
  type PasskeySignInBanner,
  type PasskeySignInIntegration,
  type PasskeySignInSurface,
} from '../../passkeys/signin-flow';

export interface UsePasskeySignInArgs {
  integration: PasskeySignInIntegration;
  authClient: PasskeySignInAuthClient;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  ftlMsgResolver: FtlMsgResolver;
  navigateWithQuery: ReturnType<typeof useNavigateWithQuery>;
  queryParams: string;
  // Frozen load-time flow snapshot for the metrics join; not the live
  // `queryParams` above, which the SPA may strip of flow params after load.
  flowQueryParams?: QueryParams;
  surface: PasskeySignInSurface;
  isButtonVisible?: boolean;
  supportsKeysOptionalLogin?: boolean;
}

type PasskeySignInStatus = 'idle' | 'loading' | 'navigating';

export interface UsePasskeySignInResult {
  /** `status !== 'idle'`. */
  isLoading: boolean;
  /** `status === 'navigating'`. */
  isNavigating: boolean;
  banner: PasskeySignInBanner | undefined;
  onClick: () => Promise<void>;
  /** Dismisses the passkey banner. */
  clearError: () => void;
}

export function usePasskeySignIn({
  integration,
  authClient,
  finishOAuthFlowHandler,
  ftlMsgResolver,
  navigateWithQuery,
  queryParams,
  flowQueryParams,
  surface,
  isButtonVisible = false,
  supportsKeysOptionalLogin,
}: UsePasskeySignInArgs): UsePasskeySignInResult {
  const [status, setStatus] = useState<PasskeySignInStatus>('idle');
  const [banner, setBanner] = useState<PasskeySignInBanner>();
  // Synchronous re-entry guard; `status` lags a render behind.
  const inFlight = useRef(false);
  // A ceremony the user walked away from must not leave material behind,
  // nor overwrite what a ceremony started on the next page has stashed.
  const mounted = useMounted();
  const navigate = useNavigate();
  const config = useConfig();
  const sensitiveDataClient = useSensitiveDataClient();

  // One impression per surface when the button is shown, so click-through is measurable.
  useGleanView(
    () =>
      GleanMetrics.passkey.buttonView({
        event: { reason: toPasskeyMetricsSurface(surface) },
      }),
    isButtonVisible
  );

  // Callers pass onClick straight to a button; it isn't memoised.
  const onClick = async () => {
    if (inFlight.current) {
      return;
    }
    setBanner(undefined);
    const { glean } = PASSKEY_SIGNIN_SURFACES[surface];

    // Button stays visible even without support — the user may have a passkey
    // on another device and deserves an explicit error rather than a silently
    // missing option.
    if (!isWebAuthnSupported()) {
      glean.submitFrontendError('not_supported');
      setBanner(
        passkeyErrorBanner(
          ftlMsgResolver,
          'passkey-authentication-error-not-supported-v2',
          'Your browser or device doesn’t support passkeys.'
        )
      );
      return;
    }

    // Defensive: webchannel-driven OAuth may leave this component mounted on
    // success; without finish() the button stays stuck in loading.
    const finish = () => {
      inFlight.current = false;
      setStatus('idle');
    };

    inFlight.current = true;
    setStatus('loading');
    glean.submit();
    // Material from an abandoned ceremony must not survive into this one.
    sensitiveDataClient.clearPasskeyWrapData();

    // True when this login still needs encryption keys that a follow-up
    // password step will provide.
    const keysRequired = integration.requiresPasswordForLogin(
      supportsKeysOptionalLogin
    );

    const wrapMaterialRequested = shouldRequestWrapMaterial(
      integration,
      config.featureFlags,
      keysRequired
    );

    try {
      const assertion = await authenticateWithPasskey({
        authClient,
        integration,
        surface,
        ftlMsgResolver,
        keysRequired,
        withWrapMaterial: wrapMaterialRequested,
        metricsContext: queryParamsToMetricsContext(flowQueryParams),
      });
      if (!assertion.ok) {
        setBanner(assertion.banner);
        finish();
        return;
      }
      const { completion, credentialId, prfOut } = assertion;

      // The PRF output must not outlive this ceremony, whichever exit is
      // taken. The opt-in stash holds its own copy.
      try {
        const account = await resolveSignedInAccount({
          authClient,
          integration,
          completion,
          ftlMsgResolver,
          navigateWithQuery,
        });
        if (!account) {
          // Defensive finish() — the merge gate navigates away, but Index →
          // Index with prefill keeps this component mounted and the button
          // needs to be clickable again.
          finish();
          return;
        }

        // Same path as password sign-in. `kB` is set when a passkey wrap
        // supplied it, so no password step is needed.
        const signIn = async (kB?: hexstring) => {
          const { error: navError } = await handleNavigation({
            navigate,
            email: account.email,
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
            kB,
            handleFxaLogin: true,
            handleFxaOAuthLogin: true,
            // On Firefox mobile, the browser finishes sign-in via WebChannel
            // messages; navigating the WebView away would interrupt it.
            performNavigation: !integration.isFirefoxMobileClient(),
            isPasskeySession: true,
            accountHasTotp: account.accountHasTotp,
            authClient,
          });
          if (navError) {
            // Synthetic Error: backend error bodies may carry identifiers.
            Sentry.captureException(new Error('passkey-signin nav error'), {
              tags: { errno: String(navError.errno ?? 'none') },
            });
            setBanner(passkeyUnexpectedBanner(ftlMsgResolver));
            finish();
            return;
          }
          // Deliberately not finish()'d — the loading state must survive the
          // hard redirect or WebChannel handoff as this component unmounts.
          setStatus('navigating');
          GleanMetrics.passkey.authSuccess({
            event: {
              reason: buildPasskeyAuthSuccessReason(
                toPasskeyMetricsSurface(surface),
                kB ? 'passkeywrap' : 'nopassword'
              ),
            },
          });
        };

        if (!keysRequired) {
          await signIn();
          return;
        }

        if (
          wrapMaterialRequested &&
          completion.verified &&
          completion.mfaToken &&
          completion.hasPassword
        ) {
          const recovered = await recoverPasswordlessKb({
            authClient,
            uid: completion.uid,
            mfaToken: completion.mfaToken,
            credentialId,
            prfOut,
            mounted,
            // The opt-in page only renders on desktop: on Firefox mobile,
            // performNavigation:false hands sign-in off to WebChannel first.
            offerOptIn: !integration.isFirefoxMobileClient(),
            sensitiveDataClient,
          });
          // Spent: zeroed now rather than after the sign-in round-trip below.
          prfOut?.fill(0);
          if (recovered.outcome === 'left') {
            return;
          }
          if (recovered.outcome === 'recovered') {
            await signIn(recovered.kB);
            return;
          }
        }

        // A password is needed to derive scoped keys before the browser
        // login/OAuth messages are sent. An existing-password account re-enters
        // its password; a passwordless account creates one.
        setStatus('navigating');
        // The passkey context lets the destination page tag its Glean
        // events with the originating surface.
        navigateWithQuery(
          completion.hasPassword
            ? '/signin_passkey_fallback'
            : '/post_verify/set_password',
          {
            state: {
              passkeySurface: toPasskeyMetricsSurface(surface),
              ...(completion.hasPassword
                ? {}
                : { passwordCreationReason: 'passkey' as const }),
            },
          }
        );
      } finally {
        prfOut?.fill(0);
      }
    } catch (err) {
      const errno = (err as { errno?: number })?.errno;
      if (errno === AuthUiErrors.PASSKEY_NOT_FOUND.errno) {
        // Expected divergence between server state and authenticator state
        // (e.g. user deleted the passkey elsewhere). Not Sentry-worthy.
        glean.submitFrontendError('no_passkey_found');
        setBanner(
          passkeyErrorBanner(
            ftlMsgResolver,
            'passkey-authentication-error-not-found',
            'Passkey not recognized. Use another sign-in method.'
          )
        );
      } else {
        // Drop upstream err.message — backend shapes may include identifiers
        // (uid, email) we can't enforce from here. errno tag + Sentry stack
        // are enough for triage.
        glean.submitFrontendError('unexpected');
        Sentry.captureException(new Error('passkey-signin error'), {
          tags: { errno: String(errno ?? 'none') },
        });
        setBanner(passkeyUnexpectedBanner(ftlMsgResolver));
      }
      finish();
    }
  };

  const clearError = useCallback(() => setBanner(undefined), []);

  return {
    isLoading: status !== 'idle',
    isNavigating: status === 'navigating',
    banner,
    onClick,
    clearError,
  };
}
