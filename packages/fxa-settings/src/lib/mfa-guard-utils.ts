/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthUiErrors } from './auth-errors/auth-errors';
import {
  JwtTokenCache,
  MfaOtpRequestCache,
  sessionToken as getSessionToken,
} from './cache';
import { MfaScope } from './types';

/**
 * Clears the MFA and JWT cache for the given scope if the error is an invalid JWT.
 *
 * Use this when checking the response from the auth server for an invalid JWT.
 * @param e - The error to check, must have code and errno properties.
 * @param scope - The scope to clear from the MFA and JWT cache.
 * @returns true if the cache was cleared, false otherwise.
 */
export const clearMfaAndJwtCacheOnInvalidJwt = (
  e: any,
  scope: MfaScope
): boolean => {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    // noop - we can't do anything without a session token
    return false;
  }
  const shouldClear = isInvalidJwtError(e);
  if (shouldClear) {
    MfaOtpRequestCache.remove(sessionToken, scope);
    JwtTokenCache.removeToken(sessionToken, scope);
  }
  return shouldClear;
};

/**
 * Checks if the error is an invalid JWT error.
 * @param e - The error to check, must have code and errno properties.
 * @returns
 */
export const isInvalidJwtError = (e: unknown): boolean => {
  return (e as any)?.errno === AuthUiErrors.INVALID_MFA_TOKEN.errno;
};
