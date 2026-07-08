/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Top-level post-signup-confirmation routing category. The OAuth 'resolve'
 * category still performs the async finishOAuthFlowHandler sub-routing in the
 * caller; this only picks which legacy branch runs. */
export type SignupCategory =
  | 'sync-desktop-v3'
  | 'oauth-totp-setup'
  | 'oauth-resolve'
  | 'web-redirect'
  | 'web-settings'
  | 'none';

export interface SignupCategoryFacts {
  isSyncDesktopV3: boolean;
  isOAuth: boolean;
  wantsTwoStepAuthentication: boolean;
  isWeb: boolean;
  hasRedirectTo: boolean;
}

/**
 * Picks the post-signup-confirmation branch, matching the legacy
 * ConfirmSignupCode if/else-if chain exactly: Sync Desktop v3 first, then OAuth
 * (TOTP setup when the relier wants 2FA, otherwise resolve the OAuth flow), then
 * web (redirect when a redirectTo is present, else settings). When no integration
 * type matches, the legacy code navigates nowhere.
 */
export function routeSignupCategory(
  facts: SignupCategoryFacts
): SignupCategory {
  if (facts.isSyncDesktopV3) return 'sync-desktop-v3';
  if (facts.isOAuth) {
    return facts.wantsTwoStepAuthentication
      ? 'oauth-totp-setup'
      : 'oauth-resolve';
  }
  if (facts.isWeb) {
    return facts.hasRedirectTo ? 'web-redirect' : 'web-settings';
  }
  return 'none';
}
