/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef } from 'react';

import * as Sentry from '@sentry/browser';

import { SETTINGS_PATH } from '../../../constants';
import { useNavigateWithQuery } from '../../../lib/hooks';
import { MfaReason } from '../../../lib/types';
import {
  useAccount,
  useAlertBar,
  useAuthClient,
  useFtlMsgResolver,
} from '../../../models';
import { isWebAuthnSupported } from '../../../lib/passkeys/webauthn';
import { createCredentialWithPrfFallback } from '../../../lib/passkeys/prf-fallback';
import {
  handleWebAuthnError,
  WebAuthnErrorType,
} from '../../../lib/passkeys/webauthn-errors';
import { MfaGuard } from '../MfaGuard';
import { useMfaErrorHandler } from '../../../lib/hooks';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../../lib/glean';
import { useGleanView } from '../../../lib/glean/useGleanView';
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

export const MfaGuardPagePasskeyAdd = () => {
  const alertBar = useAlertBar();
  const navigateWithQuery = useNavigateWithQuery();
  // Pre-check before MfaGuard mounts so an unsupported browser never triggers
  // an MFA prompt. Detection is best-effort; PagePasskeyAdd's catch block still
  // surfaces NotSupportedError defensively if the ceremony itself rejects.
  const supported = isWebAuthnSupported();
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

  const userCanceled = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  const navigateToSettings = useCallback(() => {
    navigateWithQuery(SETTINGS_PATH + '#security', { replace: true });
  }, [navigateWithQuery]);

  const handleCancel = useCallback(() => {
    if (userCanceled.current) return;
    // Mark cancellation before aborting so the in-flight ceremony's catch
    // block can suppress the resulting AbortError instead of double-firing
    // alert/navigate.
    userCanceled.current = true;
    abortController.current?.abort();
    alertBar.error(passkeyCanceledOrTimedOutMessage());
    navigateToSettings();
  }, [alertBar, navigateToSettings]);

  // `ftlMsgResolver` and `alertBar` are rebuilt on every render, so listing
  // them as effect dependencies would restart the WebAuthn prompt mid-flight.
  const latest = useRef({
    account,
    authClient,
    alertBar,
    ftlMsgResolver,
    handleMfaError,
    navigateToSettings,
  });
  useEffect(() => {
    latest.current = {
      account,
      authClient,
      alertBar,
      ftlMsgResolver,
      handleMfaError,
      navigateToSettings,
    };
  });

  // Recorded per page view, not per ceremony — the ceremony below restarts on
  // every effect run.
  useGleanView(() => GleanMetrics.accountPref.passkeyCreateView());

  useEffect(() => {
    const controller = new AbortController();
    abortController.current = controller;
    let active = true;
    const stale = () => !active || userCanceled.current;

    const runCeremony = async () => {
      // Tracks whether the server sent an excludeCredentials list (i.e., the
      // account already has passkeys). Used to bias NotAllowedError toward the
      // "duplicate authenticator" interpretation on Firefox, which collapses
      // that case and user-cancel into the same DOMException.
      let hadExcludeCredentials = false;
      try {
        // Step 1: Get registration options from server
        const jwt = latest.current.account.getCachedJwtByScope('passkey');
        const creationOptions =
          await latest.current.authClient.beginPasskeyRegistration(jwt);
        const challenge = creationOptions.challenge;
        hadExcludeCredentials = !!creationOptions.excludeCredentials?.length;

        if (stale()) return;

        // Step 2: Browser WebAuthn prompt. Silently retries without the PRF
        // extension if the first attempt fails in a way PRF could have caused
        // (e.g. Windows Hello UnknownError, FXA-13991). The retry emits a
        // dedicated metric so we can track how often PRF must be dropped and
        // decide when the retry can be removed.
        const credential = await createCredentialWithPrfFallback(
          creationOptions,
          undefined,
          controller.signal,
          ({ reason, outcome }) =>
            GleanMetrics.accountPref.passkeyCreateRetryWithoutPrfRequest({
              event: { reason, outcome },
            })
        );

        // After the WebAuthn prompt resolves we're past the abortable window;
        // if the user has clicked Cancel by this point, skip the server call
        // so we don't create a passkey the user thinks they canceled.
        if (stale()) return;

        // Step 3: Complete registration with server
        await latest.current.authClient.completePasskeyRegistration(
          jwt,
          credential,
          challenge
        );
        await latest.current.account.refresh('passkeys');

        if (stale()) return;

        // Success
        GleanMetrics.accountPref.passkeyCreateSuccessView();
        latest.current.alertBar.success(
          latest.current.ftlMsgResolver.getMsg(
            'page-passkey-add-success',
            'Passkey created'
          )
        );
        latest.current.navigateToSettings();
      } catch (error) {
        // handleCancel already showed the cancellation banner and navigated;
        // suppress the AbortError side effects so they don't double-fire.
        if (stale()) return;

        // Check if MFA JWT expired
        if (latest.current.handleMfaError(error)) return;

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
            latest.current.alertBar.error(passkeyCouldNotCompleteMessage());
            latest.current.navigateToSettings();
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
            latest.current.alertBar.error(passkeyCanceledOrTimedOutMessage());
            latest.current.navigateToSettings();
            return;
          }
          latest.current.alertBar.error(
            latest.current.ftlMsgResolver.getMsg(
              categorized.ftlId,
              categorized.fallbackText
            )
          );
          latest.current.navigateToSettings();
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
          latest.current.alertBar.error(
            getLocalizedErrorMessage(
              latest.current.ftlMsgResolver,
              error as HandledError
            )
          );
        } else {
          Sentry.captureException(error);
          latest.current.alertBar.error(
            latest.current.ftlMsgResolver.getMsg(
              'page-passkey-add-error-system-v2',
              'There was a problem creating your passkey. Try again later.'
            )
          );
        }
        latest.current.navigateToSettings();
      }
    };

    runCeremony();

    return () => {
      active = false;
      controller.abort();
      if (abortController.current === controller) {
        abortController.current = null;
      }
    };
    // Everything the effect reads arrives through `latest`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="max-w-lg mx-auto mt-6 p-10 tablet:my-10 flex flex-col items-center bg-white dark:bg-grey-700 shadow tablet:rounded-xl border border-transparent text-center"
      data-testid="page-passkey-add"
    >
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
    </div>
  );
};

export default PagePasskeyAdd;
