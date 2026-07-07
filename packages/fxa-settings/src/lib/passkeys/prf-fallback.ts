/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createCredential,
  DEFAULT_TIMEOUT_MS,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialJSON,
} from './webauthn';
import { WebAuthnErrorType } from './webauthn-errors';

/**
 * True when a registration ceremony failed with the one error the PRF extension
 * is confirmed to cause, so it's worth retrying without PRF.
 *
 * The only known PRF-attributable failure is Windows Hello rejecting the eval
 * with `UnknownError` (FXA-13991) — also WebAuthn's catch-all for transient
 * authenticator/OS failures, so a single retry is reasonable regardless.
 *
 * Deliberately narrow to that name: other "unexpected" DOMExceptions
 * (OperationError, ConstraintError, unrecognized names) aren't known to be
 * PRF-caused, and dropping PRF can't fix e.g. a ConstraintError (a residentKey/
 * userVerification constraint), so retrying them would only cost the user a
 * second device prompt before the same failure. Widen this set from the
 * `passkey_create_retry_without_prf_request` metric if the data shows another
 * error recovering on retry. Non-`DOMException` errors (TypeError,
 * password-manager plain-Error cancels) are excluded by the instanceof guard.
 */
export function isRetriableWithoutPrf(error: unknown): boolean {
  return (
    error instanceof DOMException && error.name === WebAuthnErrorType.Unknown
  );
}

/**
 * Returns the creation options with the PRF extension removed, preserving any
 * other extensions. Used to retry registration without PRF when an
 * authenticator rejects the PRF eval. Returns the original object unchanged
 * (same reference) when there is no PRF extension to strip.
 */
export function stripPrfExtension(
  options: PublicKeyCredentialCreationOptionsJSON
): PublicKeyCredentialCreationOptionsJSON {
  if (!options.extensions?.prf) {
    return options;
  }
  const remainingExtensions = { ...options.extensions };
  delete remainingExtensions.prf;
  return {
    ...options,
    extensions:
      Object.keys(remainingExtensions).length > 0
        ? remainingExtensions
        : undefined,
  };
}

/**
 * Diagnostics surfaced when the PRF fallback retry fires. Lets the caller emit
 * telemetry (e.g. Glean) without coupling this util to any metrics layer, so we
 * can measure how often PRF must be dropped and eventually retire the retry.
 */
export type PrfFallbackInfo = {
  /**
   * The DOMException `name` of the first-attempt error that triggered the retry
   * (e.g. `UnknownError`, `OperationError`).
   */
  reason: string;
  /** Whether the retry without PRF succeeded. */
  outcome: 'success' | 'failure';
};

/**
 * Runs the registration ceremony, silently retrying once without the PRF
 * extension if the first attempt fails in a way PRF could have caused.
 *
 * Requesting PRF can break creation on some OS/browser combinations even when
 * PRF is meant to be optional (FXA-13991, Windows Hello). The retry is silent:
 * no error is surfaced and no extra user action is required beyond the second
 * authenticator prompt. The same `externalSignal` is passed to both attempts,
 * so a user cancel or timeout surfaces as a non-retriable error and never
 * triggers a re-prompt.
 *
 * Only retries when the original options actually carried a PRF extension —
 * otherwise stripping is a no-op and the same error would recur.
 *
 * The retry is bounded by what remains of the original `timeoutMs` budget, so
 * the two attempts together never exceed a single timeout window — keeping the
 * overall ceremony aligned with the server-side challenge TTL and the MFA JWT
 * lifetime rather than allowing up to ~2x the intended deadline.
 *
 * When the retry fires, `onPrfFallback` is invoked exactly once with the
 * triggering error name and the retry outcome — purely for telemetry; it never
 * changes the returned credential or the error rethrown.
 */
export async function createCredentialWithPrfFallback(
  options: PublicKeyCredentialCreationOptionsJSON,
  timeoutMs?: number,
  externalSignal?: AbortSignal,
  onPrfFallback?: (info: PrfFallbackInfo) => void
): Promise<PublicKeyCredentialJSON> {
  const startedAt = Date.now();
  try {
    return await createCredential(options, timeoutMs, externalSignal);
  } catch (error) {
    if (isRetriableWithoutPrf(error) && options.extensions?.prf) {
      const budget = timeoutMs ?? DEFAULT_TIMEOUT_MS;
      const remaining = Math.max(0, budget - (Date.now() - startedAt));
      // With no budget left, a retry (timeoutMs=0) would abort immediately and
      // throw a TimeoutError that masks the original error, so rethrow the
      // original unchanged instead.
      if (remaining > 0) {
        const reason = (error as DOMException).name;
        try {
          const credential = await createCredential(
            stripPrfExtension(options),
            remaining,
            externalSignal
          );
          onPrfFallback?.({ reason, outcome: 'success' });
          return credential;
        } catch (retryError) {
          onPrfFallback?.({ reason, outcome: 'failure' });
          throw retryError;
        }
      }
    }
    throw error;
  }
}
