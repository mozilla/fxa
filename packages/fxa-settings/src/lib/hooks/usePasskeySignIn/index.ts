/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { useNavigate } from 'react-router';

import { AuthUiErrors } from '../../auth-errors/auth-errors';
import GleanMetrics from '../../glean';
import { useGleanView } from '../../glean/useGleanView';
import { useNavigateWithQuery } from '../useNavigateWithQuery';
import { FinishOAuthFlowHandler } from '../../oauth/hooks';
import { storeAccountData } from '../../storage-utils';
import {
  ensureCanLinkAcountOrRedirect,
  handleNavigation,
} from '../../../pages/Signin/utils';
import { queryParamsToMetricsContext } from '../../metrics';
import type { QueryParams } from '../../..';
import {
  handleWebAuthnError,
  isWebAuthnSupported,
  type PublicKeyCredentialJSON,
} from '../../passkeys';
import {
  extractPrfOutput,
  extractPrfSupport,
  getCredentialWithPrfFallback,
  stripPrfResults,
} from '../../passkeys/prf-fallback';
import {
  isOAuthNativeIntegration,
  useConfig,
  useSensitiveDataClient,
} from '../../../models';
import {
  PASSKEY_SIGNIN_SURFACES,
  toPasskeyMetricsSurface,
  buildPasskeyAuthSuccessReason,
  resolvePasskeyService,
  passkeyErrorBanner,
  passkeyUnexpectedBanner,
  passkeyTroubleBanner,
  passkeyTimeoutBanner,
  type PasskeySignInBanner,
  type PasskeySignInIntegration,
  type PasskeySignInSurface,
} from '../../passkeys/signin-flow';

/** Pick<> so tests can pass minimal mocks without `as any`. */
export type PasskeySignInAuthClient = Pick<
  AuthClient,
  | 'beginPasskeyAuthentication'
  | 'completePasskeyAuthentication'
  | 'account'
  | 'sessionResendVerifyCode'
  | 'getPasskeyWrap'
>;

/**
 * False only when the server says no usable wrap is stored for this passkey:
 * none at all, or one that predates the account's key rotation and will be
 * replaced on store. Any other answer, including a lookup failure, counts as
 * stored so the opt-in is withheld.
 *
 * TODO(FXA-13152): interim. Passwordless sign-in fetches the wrap to open it
 * and reads errno 234 off that same call as the opt-in signal, so this
 * existence probe goes away.
 */
async function hasStoredWrap(
  authClient: PasskeySignInAuthClient,
  mfaToken: string,
  credentialId: string
): Promise<boolean> {
  try {
    await authClient.getPasskeyWrap(mfaToken, credentialId);
    return true;
  } catch (err) {
    const errno = (err as { errno?: number })?.errno;
    if (
      errno === ERRNO.PASSKEY_WRAP_NOT_FOUND ||
      errno === ERRNO.PASSKEY_WRAP_STALE
    ) {
      return false;
    }
    // Expected while the server flag lags the client's, or when the probe's
    // own rate limit trips; neither says anything is wrong.
    if (errno === ERRNO.FEATURE_NOT_ENABLED || errno === ERRNO.THROTTLED) {
      return true;
    }
    // Withholding the offer is the safe outcome, but an outage would
    // otherwise look identical to "already enrolled".
    Sentry.captureException(new Error('passkey-wrap-probe error'), {
      tags: { errno: String(errno ?? 'none') },
    });
    return true;
  }
}

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
  // Frozen load-time flow snapshot for the metrics join; not the live
  // `queryParams` above, which the SPA may strip of flow params after load.
  flowQueryParams?: QueryParams;
  surface: PasskeySignInSurface;
  isButtonVisible?: boolean;
  supportsKeysOptionalLogin?: boolean;
}

export type PasskeySignInStatus = 'idle' | 'loading' | 'navigating';

export interface UsePasskeySignInResult {
  status: PasskeySignInStatus;
  /** `status !== 'idle'`. */
  isLoading: boolean;
  /** `status === 'navigating'`. */
  isNavigating: boolean;
  banner: PasskeySignInBanner | undefined;
  onClick: () => Promise<void>;
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
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
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
    const setUnexpectedError = () =>
      setBanner(passkeyUnexpectedBanner(ftlMsgResolver));

    inFlight.current = true;
    setStatus('loading');
    glean.submit();
    // Material from an abandoned ceremony must not survive into this one.
    sensitiveDataClient.clearPasskeyWrapData();

    // True when this login still needs encryption keys that a follow-up
    // password step will provide. Computed up front so it can also hint the
    // server whether to request PRF under the keys-required scope; reused below
    // to route to the password step.
    const keysRequired = integration.requiresPasswordForLogin(
      supportsKeysOptionalLogin
    );

    // Desktop Sync sign-ins need encryption keys and so end in a password
    // step, after which a passkey wrap can be offered: that is the only flow
    // where `kB` is derived client-side. Mobile clients close the web view at
    // handoff, so the page that makes the offer would never be seen there.
    // Other Firefox services that want keys keep their own landing pages and
    // are not offered.
    const offerPasswordlessSyncSetup =
      !!config.featureFlags?.passkeyPasswordlessSyncEnabled &&
      keysRequired &&
      isOAuthNativeIntegration(integration) &&
      integration.isSync() &&
      !integration.isFirefoxMobileClient();

    try {
      // Discoverable credentials only — the Signin page's email field is
      // intentionally ignored. The browser surfaces all credentials for the
      // RP and the user picks one. The keysRequired hint lets the server decide
      // whether to attach the PRF extension to the returned options. The scope
      // makes /finish mint the `mfa:passkey` proof that storing a wrap needs.
      const challengeOptions = await authClient.beginPasskeyAuthentication({
        keysRequired,
        ...(offerPasswordlessSyncSetup ? { scope: 'passkey' } : {}),
      });

      // Isolated try/catch so a network-layer TypeError (e.g. fetch failure)
      // from surrounding auth-client calls can't be miscategorised as a
      // WebAuthn error.
      let credential: PublicKeyCredentialJSON;
      try {
        // If the server attached PRF and the first attempt fails in a way PRF
        // could have caused, retry once without PRF (never blocks sign-in).
        credential = await getCredentialWithPrfFallback(
          challengeOptions,
          undefined,
          ({ reason, outcome }) => {
            GleanMetrics.passkey.signinRetryWithoutPrfRequest({
              event: { reason, outcome },
            });
          }
        );
      } catch (err) {
        if (err instanceof DOMException || err instanceof TypeError) {
          const categorized = handleWebAuthnError(
            err,
            'authentication',
            Sentry.captureException
          );
          glean.submitFrontendError(categorized.gleanReason);
          // Cancelled and timed-out ceremonies are benign — warn, don't error.
          if (categorized.gleanReason === 'not_allowed') {
            setBanner(passkeyTroubleBanner(ftlMsgResolver, surface));
          } else if (categorized.gleanReason === 'timeout') {
            setBanner(passkeyTimeoutBanner(ftlMsgResolver));
          } else {
            setBanner(
              passkeyErrorBanner(
                ftlMsgResolver,
                categorized.ftlId,
                categorized.fallbackText
              )
            );
          }
          finish();
          return;
        }
        throw err;
      }

      // Read support (presence only) before stripping the output from the
      // credential; only meaningful when the server requested PRF.
      const prfRequested = !!challengeOptions.extensions?.prf;
      const prfSupported = prfRequested && extractPrfSupport(credential);
      if (prfRequested) {
        GleanMetrics.passkey.signinPrfSupport({
          event: { supported: prfSupported ? 'present' : 'absent' },
        });
      }
      const prfOut = offerPasswordlessSyncSetup
        ? extractPrfOutput(credential)
        : undefined;
      credential = stripPrfResults(credential);

      const serviceForRequest = resolvePasskeyService(integration);
      const metricsContext = queryParamsToMetricsContext(flowQueryParams);

      const completion = await authClient.completePasskeyAuthentication(
        credential,
        challengeOptions.challenge,
        {
          ...(serviceForRequest ? { service: serviceForRequest } : {}),
          // The server uses keysRequired to defer its login metrics/email
          // framing until keys exist; the client uses the same value below to
          // route to that step.
          keysRequired,
          ...(prfRequested ? { prfSupported } : {}),
          metricsContext,
        }
      );

      glean.submitSuccess();

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

      // Held in memory only, for the opt-in page after the password step. That
      // step adds `kB`; the page clears the entry whatever the user decides.
      // An account that still has to create a password is not offered the
      // opt-in on the same sign-in, nor is a passkey that already has a wrap.
      if (
        prfOut &&
        completion.mfaToken &&
        completion.hasPassword &&
        !(await hasStoredWrap(
          authClient,
          completion.mfaToken,
          credential.id
        )) &&
        mounted.current
      ) {
        sensitiveDataClient.PasskeyWrapData = {
          uid: completion.uid,
          credentialId: credential.id,
          mfaToken: completion.mfaToken,
          prfOut,
        };
      }

      if (keysRequired) {
        // A password is needed to derive scoped keys before the browser
        // login/OAuth messages are sent. An existing-password account re-enters
        // its password; a passwordless account creates one.
        const fallbackPath = completion.hasPassword
          ? '/signin_passkey_fallback'
          : '/post_verify/set_password';
        setStatus('navigating');
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
        navigate,
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
        authClient,
      });

      if (navError) {
        Sentry.captureException(navError);
        setUnexpectedError();
        finish();
      } else {
        // Deliberately not finish()'d — the loading state must survive the hard
        // redirect or WebChannel handoff as this component unmounts.
        setStatus('navigating');
        GleanMetrics.passkey.authSuccess({
          event: {
            reason: buildPasskeyAuthSuccessReason(
              toPasskeyMetricsSurface(surface),
              'nopassword'
            ),
          },
        });
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
        setUnexpectedError();
      }
      finish();
    }
  };

  return {
    status,
    isLoading: status !== 'idle',
    isNavigating: status === 'navigating',
    banner,
    onClick,
  };
}
