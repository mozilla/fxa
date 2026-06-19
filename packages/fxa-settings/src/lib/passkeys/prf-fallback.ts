/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PublicKeyCredentialCreationOptionsJSON } from './webauthn';
import {
  categorizeWebAuthnError,
  WebAuthnErrorCategory,
} from './webauthn-errors';

/**
 * True when a registration ceremony failed in a way that requesting the
 * optional PRF extension could have caused — i.e. it's worth retrying without
 * PRF.
 *
 * PRF is best-effort: a spec-compliant browser ignores it when it can't honour
 * it, so a ceremony that fails *because* PRF was requested is a browser/OS bug
 * with no proper error to report — it surfaces as an "unexpected" DOMException
 * (Windows Hello throws `UnknownError`; other stacks could throw
 * `OperationError`, `DataError`, an unrecognized name, etc.). Rather than
 * hardcode one name, reuse the shared categorizer and match its `Unexpected`
 * bucket.
 *
 * Deliberately excluded:
 *  - `UserAction` (NotAllowed/Abort/Timeout) — user cancelled; never re-prompt.
 *  - non-`DOMException` (TypeError, password-manager plain-Error cancels) — the
 *    categorizer's default is `Unexpected`, so the instanceof guard keeps those
 *    out.
 *  - `DevicePlatform` (Security/InvalidState/NotReadable/NotSupported) — rp
 *    mismatch / duplicate / I/O, which dropping PRF won't fix and which have
 *    better specific messages.
 */
export function isRetriableWithoutPrf(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    categorizeWebAuthnError(error, 'registration').category ===
      WebAuthnErrorCategory.Unexpected
  );
}

/**
 * Returns the creation options with the PRF extension removed, preserving any
 * other extensions. Used to retry registration without PRF when an
 * authenticator rejects the PRF probe. Returns the original object unchanged
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
