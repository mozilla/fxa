/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import * as Sentry from '@sentry/browser';

import { SETTINGS_PATH } from '../../../constants';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { MfaReason } from '../../../lib/types';
import {
  useAccount,
  useAlertBar,
  useAuthClient,
  useFtlMsgResolver,
} from '../../../models';
import {
  createCredential,
  isWebAuthnLevel3Supported,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialJSON,
} from '../../../lib/passkeys/webauthn';
import {
  isRetriableWithoutPrf,
  stripPrfExtension,
} from '../../../lib/passkeys/prf-fallback';
import {
  handleWebAuthnError,
  WebAuthnErrorType,
} from '../../../lib/passkeys/webauthn-errors';
import { MfaGuard, useMfaErrorHandler } from '../MfaGuard';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { Banner } from '../../Banner';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../../lib/glean';
import {
  getLocalizedErrorMessage,
  HandledError,
} from '../../../lib/error-utils';
import { AuthUiErrorNos } from '../../../lib/auth-errors/auth-errors';
import {
  passkeyCanceledOrTimedOutMessage,
  passkeyCouldNotCompleteMessage,
  unsupportedPasskeyMessage,
} from '../../../lib/passkeys/unsupported-message';

export const MfaGuardPagePasskeyAdd = (_: RouteComponentProps) => {
  const alertBar = useAlertBar();
  const navigateWithQuery = useNavigateWithQuery();
  // Pre-check before MfaGuard mounts so an unsupported browser never triggers
  // an MFA prompt. Detection is best-effort; PagePasskeyAdd's catch block still
  // surfaces NotSupportedError defensively if the ceremony itself rejects.
  const supported = isWebAuthnLevel3Supported();
  // prevent multiple redirects before unmount
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!supported && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      alertBar.error(unsupportedPasskeyMessage());
      navigateWithQuery(SETTINGS_PATH + '#security', { replace: true });
    }
  }, [supported, alertBar, navigateWithQuery]);

  if (!supported) return null;

  return (
    <MfaGuard requiredScope="passkey" reason={MfaReason.createPasskey}>
      <PagePasskeyAdd />
    </MfaGuard>
  );
};

export const PagePasskeyAdd = () => {
  const account = useAccount();
  const authClient = useAuthClient();
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const handleMfaError = useMfaErrorHandler();

  const ceremonyStarted = useRef(false);
  const isMounted = useRef(true);
  const wasCanceled = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // When a platform authenticator rejects the PRF probe (e.g. Windows Hello
  // without the PRF platform update) we stay on this page and offer a retry
  // instead of bouncing to settings. The cached registration lets "Try again"
  // call createCredential immediately — preserving the click's user activation
  // — rather than re-fetching options first.
  const [showPrfRetry, setShowPrfRetry] = useState(false);
  const prfRetry = useRef<{
    jwt: string;
    creationOptions: PublicKeyCredentialCreationOptionsJSON;
    challenge: string;
  } | null>(null);
  const retryInFlight = useRef(false);

  const navigateToSettings = useCallback(() => {
    navigateWithQuery(SETTINGS_PATH + '#security', { replace: true });
  }, [navigateWithQuery]);

  const handleCancel = useCallback(() => {
    if (wasCanceled.current) return;
    // Mark cancellation before aborting so the in-flight ceremony's catch
    // block can suppress the resulting AbortError instead of double-firing
    // alert/navigate.
    wasCanceled.current = true;
    abortController.current?.abort();
    alertBar.error(passkeyCanceledOrTimedOutMessage());
    navigateToSettings();
  }, [alertBar, navigateToSettings]);

  // Shared success tail for both the initial ceremony and the no-PRF retry.
  const finishRegistration = useCallback(
    async (
      jwt: string,
      credential: PublicKeyCredentialJSON,
      challenge: string
    ) => {
      await authClient.completePasskeyRegistration(jwt, credential, challenge);
      await account.refresh('passkeys');
      if (!isMounted.current || wasCanceled.current) return;
      GleanMetrics.accountPref.passkeyCreateSuccessView();
      alertBar.success(
        ftlMsgResolver.getMsg('page-passkey-add-success', 'Passkey created')
      );
      navigateToSettings();
    },
    [account, authClient, alertBar, ftlMsgResolver, navigateToSettings]
  );

  // "Try again" after a PRF-probe rejection: retry without PRF. The click is a
  // fresh user activation, so createCredential runs before any other await to
  // keep that activation valid for the browser prompt.
  const handlePrfRetry = useCallback(async () => {
    const cached = prfRetry.current;
    if (retryInFlight.current || !cached) return;
    retryInFlight.current = true;
    setShowPrfRetry(false);
    GleanMetrics.accountPref.passkeyCreateView();

    const controller = new AbortController();
    abortController.current = controller;
    try {
      const credential = await createCredential(
        stripPrfExtension(cached.creationOptions),
        undefined,
        controller.signal
      );
      if (!isMounted.current || wasCanceled.current) return;
      await finishRegistration(cached.jwt, credential, cached.challenge);
    } catch (error) {
      if (!isMounted.current || wasCanceled.current) return;
      if (handleMfaError(error)) return;
      // The no-PRF retry failed too — return to settings with the generic
      // help-link message. Skip Sentry for user cancellations.
      const isUserCancel =
        error instanceof DOMException &&
        (error.name === 'NotAllowedError' || error.name === 'AbortError');
      if (!isUserCancel) {
        Sentry.captureException(error);
      }
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError({
        event: { reason: 'prf_retry_failed' },
      });
      alertBar.error(passkeyCouldNotCompleteMessage());
      navigateToSettings();
    } finally {
      retryInFlight.current = false;
    }
  }, [alertBar, finishRegistration, handleMfaError, navigateToSettings]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Sticky guard so a StrictMode dry-run unmount doesn't surface as a
      // spurious error banner on remount.
      wasCanceled.current = true;
      abortController.current?.abort();
      abortController.current = null;
    };
  }, []);

  useEffect(() => {
    if (ceremonyStarted.current) return;
    ceremonyStarted.current = true;

    const controller = new AbortController();
    abortController.current = controller;

    const runCeremony = async () => {
      GleanMetrics.accountPref.passkeyCreateView();

      // Tracks whether the server sent an excludeCredentials list (i.e., the
      // account already has passkeys). Used to bias NotAllowedError toward the
      // "duplicate authenticator" interpretation on Firefox, which collapses
      // that case and user-cancel into the same DOMException.
      let hadExcludeCredentials = false;
      try {
        // Step 1: Get registration options from server
        const jwt = account.getCachedJwtByScope('passkey');
        const creationOptions = await authClient.beginPasskeyRegistration(jwt);
        const challenge = creationOptions.challenge;
        hadExcludeCredentials = !!creationOptions.excludeCredentials?.length;

        if (!isMounted.current || wasCanceled.current) return;

        // Step 2: Browser WebAuthn prompt.
        let credential: PublicKeyCredentialJSON;
        try {
          credential = await createCredential(
            creationOptions,
            undefined,
            controller.signal
          );
        } catch (createError) {
          // Some platform authenticators (e.g. Windows Hello without the PRF
          // platform update) reject the whole ceremony — before any prompt —
          // when PRF is requested. PRF only powers Phase-2 passwordless Sync,
          // so stay on the page and offer a retry without it instead of
          // failing registration outright.
          if (
            isRetriableWithoutPrf(createError) &&
            creationOptions.extensions?.prf
          ) {
            if (!isMounted.current || wasCanceled.current) return;
            prfRetry.current = { jwt, creationOptions, challenge };
            GleanMetrics.accountPref.passkeyCreateSubmitFrontendError({
              event: { reason: 'prf_unsupported' },
            });
            setShowPrfRetry(true);
            return;
          }
          throw createError;
        }

        // After the WebAuthn prompt resolves we're past the abortable window;
        // if the user has clicked Cancel by this point, skip the server call
        // so we don't create a passkey the user thinks they canceled.
        if (!isMounted.current || wasCanceled.current) return;

        // Step 3: Complete registration with server
        await finishRegistration(jwt, credential, challenge);
      } catch (error) {
        // handleCancel already showed the cancellation banner and navigated;
        // suppress the AbortError side effects so they don't double-fire.
        if (!isMounted.current || wasCanceled.current) return;

        // Check if MFA JWT expired
        if (handleMfaError(error)) return;

        // Check if WebAuthn error
        if (error instanceof DOMException || error instanceof TypeError) {
          const categorized = handleWebAuthnError(
            error,
            'registration',
            Sentry.captureException,
            { hadExcludeCredentials }
          );
          const reasonMap: Record<string, string> = {
            [WebAuthnErrorType.NotAllowed]: 'not_allowed',
            [WebAuthnErrorType.Abort]: 'abort',
            [WebAuthnErrorType.Timeout]: 'timeout',
            [WebAuthnErrorType.NotSupported]: 'not_supported',
            [WebAuthnErrorType.Security]: 'security',
          };
          GleanMetrics.accountPref.passkeyCreateSubmitFrontendError({
            event: {
              reason: reasonMap[categorized.errorType] || 'webauthn_unknown',
            },
          });
          if (categorized.errorType === WebAuthnErrorType.NotSupported) {
            // NotSupportedError at this stage means the ceremony was refused
            // (e.g., algorithm/attestation mismatch, requireResidentKey on a non-RK authenticator, etc.),
            // not that the browser doesn't support WebAuthn at all — the MfaGuard's pre-check would have caught that.
            alertBar.error(passkeyCouldNotCompleteMessage());
            navigateToSettings();
            return;
          }
          if (
            categorized.errorType === WebAuthnErrorType.Abort ||
            categorized.errorType === WebAuthnErrorType.Timeout
          ) {
            // FXA-13805/13806: timeouts and aborts share the cancel/timeout
            // banner (per Figma). NotAllowedError is excluded — WebAuthn
            // conflates cancel with UV failure under that name, so it falls
            // through to the generic categorizer below.
            alertBar.error(passkeyCanceledOrTimedOutMessage());
            navigateToSettings();
            return;
          }
          alertBar.error(
            ftlMsgResolver.getMsg(categorized.ftlId, categorized.fallbackText)
          );
          navigateToSettings();
          return;
        }

        // Server error. Also catches the plain `Error` that some
        // password-manager extensions (e.g. Bitwarden)
        // throw on cancel instead of a DOMException — those bypass
        // the WebAuthn branch above.
        const handledError = error as HandledError;
        const isKnownAuthError = !!(
          handledError?.errno && AuthUiErrorNos[handledError.errno]
        );

        GleanMetrics.accountPref.passkeyCreateSubmitFrontendError({
          event: {
            reason: isKnownAuthError
              ? `auth_error_${handledError.errno}`
              : 'server_error',
          },
        });

        if (isKnownAuthError) {
          alertBar.error(
            getLocalizedErrorMessage(ftlMsgResolver, error as HandledError)
          );
        } else {
          Sentry.captureException(error);
          alertBar.error(
            ftlMsgResolver.getMsg(
              'page-passkey-add-error-system-v2',
              'There was a problem creating your passkey. Try again later.'
            )
          );
        }
        navigateToSettings();
      }
    };

    runCeremony();
  }, [
    account,
    authClient,
    alertBar,
    ftlMsgResolver,
    handleMfaError,
    navigateToSettings,
    finishRegistration,
  ]);

  return (
    <div
      className="max-w-lg mx-auto mt-6 p-10 tablet:my-10 flex flex-col items-center bg-white dark:bg-grey-700 shadow tablet:rounded-xl border border-transparent text-center"
      data-testid="page-passkey-add"
    >
      {showPrfRetry ? (
        <div className="w-full">
          <Banner
            type="error"
            content={{
              localizedHeading: ftlMsgResolver.getMsg(
                'page-passkey-add-incomplete',
                'Passkey setup didn’t complete.'
              ),
            }}
          />
          <FtlMsg id="page-passkey-add-incomplete-body">
            <p className="text-sm text-grey-500 dark:text-grey-200 mb-6">
              Your device didn’t accept the request. Let’s try again.
            </p>
          </FtlMsg>
          <FtlMsg id="page-passkey-add-try-again">
            <button
              onClick={handlePrfRetry}
              className="cta-primary cta-xl w-full"
              data-testid="passkey-add-retry"
            >
              Try again
            </button>
          </FtlMsg>
          <FtlMsg id="page-passkey-add-cancel">
            <button
              onClick={handleCancel}
              className="link-blue text-sm mt-4"
              data-testid="passkey-add-cancel"
            >
              Cancel
            </button>
          </FtlMsg>
        </div>
      ) : (
        <>
          <LoadingSpinner className="flex justify-center mb-6" />
          <FtlMsg id="page-passkey-add-creating-heading">
            <h2 className="text-xl font-bold mb-2">Creating passkey…</h2>
          </FtlMsg>
          <FtlMsg id="page-passkey-add-follow-prompts">
            <p className="text-grey-400 dark:text-grey-200 mb-6">
              Follow the prompts on your device.
            </p>
          </FtlMsg>
          <FtlMsg id="page-passkey-add-cancel">
            <button
              onClick={handleCancel}
              className="link-blue text-sm"
              data-testid="passkey-add-cancel"
              data-glean-id="account_pref_passkey_create_cancel"
            >
              Cancel
            </button>
          </FtlMsg>
        </>
      )}
    </div>
  );
};

export default PagePasskeyAdd;
