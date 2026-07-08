/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Outcome of the Settings access guard (the AAL2 / verification gate). */
export type SettingsAccessDecision =
  | { kind: 'allow' }
  | { kind: 'redirect'; to: '/' }
  | { kind: 'redirect'; to: '/signin_totp_code' };

export interface SettingsAccessFacts {
  emailVerified: boolean;
  sessionVerified: boolean;
  /** Session meets the account's minimum AAL (false when 2FA is required but not yet satisfied this session). */
  sessionVerificationMeetsAAL: boolean;
}

/**
 * Decides whether a session may access Settings. Behaviorally identical to the
 * legacy Settings root guard: an unverified email or session is sent to the
 * root (re-auth); a verified session that does not meet the account's minimum
 * AAL is sent to TOTP entry to step up; otherwise access is allowed. The
 * missing-account localStorage case (a thrown read) is handled by the caller,
 * not here.
 */
export function routeSettingsAccess(
  facts: SettingsAccessFacts
): SettingsAccessDecision {
  if (!facts.emailVerified || !facts.sessionVerified) {
    return { kind: 'redirect', to: '/' };
  }
  if (!facts.sessionVerificationMeetsAAL) {
    return { kind: 'redirect', to: '/signin_totp_code' };
  }
  return { kind: 'allow' };
}
