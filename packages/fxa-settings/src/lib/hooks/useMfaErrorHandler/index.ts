/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createContext, useCallback, useContext } from 'react';
import { MfaScope } from '../../types';
import { clearMfaAndJwtCacheOnInvalidJwt } from '../../mfa-guard-utils';

/** Scope of the MfaGuard wrapping the current subtree; undefined outside one. */
export const MfaContext = createContext<MfaScope | undefined>(undefined);

// The session token the active guard is keyed on. Provided by `MfaGuardCore`
// so `useMfaErrorHandler` clears the correct session's cache even when the host
// (e.g. the Signin inline flows) injects a session token other than the global
// one. Left undefined by Settings stories/mocks, where the global token is
// correct, so the hook falls back to it.
export const MfaSessionTokenContext = createContext<string | undefined>(
  undefined
);

/**
 * Hook to handle MFA-related errors in child components.
 * The returned function returns true if the error was handled, false otherwise.
 */
export const useMfaErrorHandler = () => {
  const scope = useContext(MfaContext);
  const sessionToken = useContext(MfaSessionTokenContext);

  if (!scope) {
    throw new Error('useMfaErrorHandler must be used within an MfaGuard');
  }

  // Memoize to prevent unnecessary re-renders
  return useCallback(
    (error: unknown) => {
      return clearMfaAndJwtCacheOnInvalidJwt(error, scope, sessionToken);
    },
    [scope, sessionToken]
  );
};
