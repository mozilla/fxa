/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { AuthContext } from './types';

/**
 * Canonical AuthContext for reducer/guard unit tests. Defaults to a verified
 * email, unverified session, plain-web non-TOTP account; override per test.
 */
export const makeCtx = (over: Partial<AuthContext> = {}): AuthContext => ({
  emailVerified: true,
  sessionVerified: false,
  accountHasTotp: false,
  hasRecoveryPhone: false,
  hasPassword: true,
  hasLinkedAccount: false,
  hasCachedSession: false,
  passwordlessSupported: false,
  isOAuth: false,
  isOAuthWeb: false,
  isOAuthNative: false,
  isSync: false,
  isWebChannelIntegration: false,
  supportsKeysOptionalLogin: false,
  requiresKeys: false,
  wantsKeysIfPasswordEntered: false,
  wantsLogin: false,
  clientInfoLoadFailed: false,
  ...over,
});
