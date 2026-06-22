/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationMethods from '../../constants/verification-methods';
import type { AuthContext } from './types';

export const guards = {
  isFullyVerified: (c: AuthContext) => c.emailVerified && c.sessionVerified,

  requiresPasswordForLogin: (c: AuthContext) =>
    c.requiresKeys ||
    (!c.supportsKeysOptionalLogin && c.wantsKeysIfPasswordEntered),

  /** R-18/R-23 safety net: prefer the live account fact over the echoed method. */
  needsTotp: (c: AuthContext) =>
    c.accountHasTotp || c.verificationMethod === VerificationMethods.TOTP_2FA,

  shouldRedirectToPasswordless: (c: AuthContext) =>
    c.passwordlessSupported &&
    !c.hasPassword &&
    !c.hasLinkedAccount &&
    !c.hasCachedSession &&
    !c.skipPasswordlessRedirect,

  showAlternativeAuth: (c: AuthContext) => c.hasLinkedAccount && !c.hasPassword,

  passwordNeeded: (c: AuthContext) =>
    !c.hasCachedSession ||
    c.requiresKeys ||
    (!c.supportsKeysOptionalLogin && c.wantsKeysIfPasswordEntered) ||
    (c.isOAuthWeb && (c.requiresKeys || c.wantsKeysIfPasswordEntered)) ||
    (c.isOAuth && c.wantsLogin),

  showCached: (c: AuthContext) =>
    c.hasCachedSession &&
    (!c.hasPassword ||
      !guards.passwordNeeded(c) ||
      (c.hasCachedSession && c.supportsKeysOptionalLogin)),

  /** Only a freshly-entered password can re-stretch v1→v2; cached/passwordless/passkey cannot. */
  canUpgradeCredentials: (c: AuthContext) => c.hasPassword,
};
