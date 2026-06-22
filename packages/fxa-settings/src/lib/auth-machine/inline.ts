/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Destinations the InlineTotpSetup state-settled redirect can route to.
 * null means "stay on the page, nothing to do yet".
 */
export type InlineTotpSetupRoute =
  | '/'
  | '/signin_totp_code'
  | '/signin_token_code'
  | null;

export interface InlineTotpSetupFacts {
  isSignedIn: boolean;
  /** null when signinState is absent. */
  hasSigninState: boolean;
  /** undefined while the TOTP-status check is still in-flight. */
  totpVerified?: boolean;
  /** undefined while the session-verified check is still in-flight. */
  sessionVerified?: boolean;
}

/**
 * Decides where InlineTotpSetup redirects once state has settled.
 * Mirrors the legacy priority order in the container's useEffect:
 * missing auth context -> root; TOTP already active -> totp-code page;
 * session not verified -> token-code page; otherwise stay (null).
 */
export function routeAfterInlineTotpSetup(
  facts: InlineTotpSetupFacts
): InlineTotpSetupRoute {
  if (!facts.isSignedIn || !facts.hasSigninState) {
    return '/';
  }
  if (facts.totpVerified) {
    return '/signin_totp_code';
  }
  if (facts.sessionVerified === false) {
    return '/signin_token_code';
  }
  return null;
}
