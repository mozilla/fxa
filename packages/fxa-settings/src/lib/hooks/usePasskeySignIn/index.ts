/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import type AuthClient from 'fxa-auth-client/browser';
import { uint8ToHex } from 'fxa-auth-client/lib/utils';
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
import type { SigninLocationState } from '../../../pages/Signin/interfaces';
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
  isOAuthNativeIntegrationSync,
  isSyncDesktopV3Integration,
  useConfig,
  useSensitiveDataClient,
} from '../../../models';
import { SensitiveData } from '../../sensitive-data-client';
import type { UnwrapPasskeyKbResult } from '../../passkeys/wrap/consumption';
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
    sensitiveDataClient.setDataType(SensitiveData.Key.PasskeyWrap, undefined);

    // True when this login still needs Sync-scoped keys that a follow-up
    // password step will provide. Computed up front so it can also hint the
    // server whether to request PRF under the keys-required scope; reused below
    // to route to the password step.
    const keysRequired = integration.requiresPasswordForLogin(
      supportsKeysOptionalLogin
    );

    // Only OAuth-native Sync can take kB straight into the flow; desktop v3
    // sends keyFetchToken/unwrapBKey over WebChannel and has no passwordless
    // path.
    const passwordlessSync =
      !!config.featureFlags?.passkeyPasswordlessSyncEnabled &&
      keysRequired &&
      isOAuthNativeIntegrationSync(integration) &&
      !isSyncDesktopV3Integration(integration);

    try {
      // Discoverable credentials only — the Signin page's email field is
      // intentionally ignored. The browser surfaces all credentials for the
      // RP and the user picks one. The keysRequired hint lets the server decide
      // whether to attach the PRF extension to the returned options. The scope
      // makes /finish mint the `mfa:passkey` proof that storing a wrap needs.
      const challengeOptions = await authClient.beginPasskeyAuthentication({
        keysRequired,
        ...(passwordlessSync ? { scope: 'passkey' } : {}),
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
      const prfOut = passwordlessSync
        ? extractPrfOutput(credential)
        : undefined;
      // The extracted PRF output must not outlive this ceremony, whichever
      // exit is taken. The opt-in copy is stashed or zeroed separately.
      try {
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

        const accountHasTotp = !!account?.totp?.verified;

        // Shared by the keys-optional and passwordless Sync paths; `kB` is set
        // only by the latter, where a passkey wrap supplied it.
        const completeSignIn = async (kB?: hexstring) => {
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
            kB,
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
            return;
          }
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
        };

        if (keysRequired) {
          // A password is needed to derive scoped keys before the browser
          // login/OAuth messages are sent. An existing-password account re-enters
          // its password; a passwordless account creates one.
          const fallbackPath = completion.hasPassword
            ? '/signin_passkey_fallback'
            : '/post_verify/set_password';
          let passkeyFallback: SigninLocationState['passkeyFallback'];

          if (
            passwordlessSync &&
            completion.mfaToken &&
            completion.hasPassword
          ) {
            // unwrapPasskeyKb zeroes what it is given; the opt-in needs its own copy.
            const prfForOptIn = prfOut && new Uint8Array(prfOut);
            let unwrapped: UnwrapPasskeyKbResult;
            try {
              // Loaded on demand: the wrap module pulls in the HPKE suite,
              // which would otherwise ship in the chunk every sign-in loads.
              const { unwrapPasskeyKb } = await import(
                '../../passkeys/wrap/consumption'
              );
              unwrapped = await unwrapPasskeyKb(authClient, {
                mfaToken: completion.mfaToken,
                credentialId: credential.id,
                uid: completion.uid,
                prfOut,
              });
            } catch {
              // A rejected chunk load (e.g. offline) must fall back like any
              // other unwrap failure, not surface as the generic error banner.
              unwrapped = { ok: false, reason: 'fetch_failed' };
            }

            if (unwrapped.ok) {
              prfForOptIn?.fill(0);
              const kB = uint8ToHex(unwrapped.kB);
              unwrapped.kB.fill(0);
              await completeSignIn(kB);
              return;
            }

            passkeyFallback = {
              credentialId: credential.id,
              reason: unwrapped.reason,
            };
            // Held in memory only, for the opt-in page after the password step.
            // That step adds `kB`; the page clears the entry whatever the user
            // decides. Only a passkey with nothing stored gets the offer.
            // The opt-in page only renders on desktop — on Firefox mobile,
            // performNavigation:false hands sign-in off to WebChannel before
            // it could ever be reached.
            if (
              unwrapped.reason === 'no_wrap' &&
              prfForOptIn &&
              !integration.isFirefoxMobileClient()
            ) {
              sensitiveDataClient.setDataType(SensitiveData.Key.PasskeyWrap, {
                uid: completion.uid,
                credentialId: credential.id,
                mfaToken: completion.mfaToken,
                prfOut: prfForOptIn,
              });
            } else {
              prfForOptIn?.fill(0);
            }
          }

          setStatus('navigating');
          // Thread the passkey context so the destination page can tag its Glean
          // events with the originating surface.
          navigateWithQuery(fallbackPath, {
            state: completion.hasPassword
              ? {
                  passkeySurface: toPasskeyMetricsSurface(surface),
                  ...(passkeyFallback ? { passkeyFallback } : {}),
                }
              : {
                  passwordCreationReason: 'passkey' as const,
                  passkeySurface: toPasskeyMetricsSurface(surface),
                },
          });
          return;
        }

        await completeSignIn();
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
