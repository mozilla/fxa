/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAUTH_NATIVE_CLIENT_IDS } from './oauth';

/** A row of accountAuthorizations. */
export interface AuthorizationRow {
  scope: string;
  service: string;
  clientId: string;
  lastAuthorizedTosAt: number;
}

export interface RemainingRefreshToken {
  clientId: string;
  /** A ScopeSet, so hierarchical scopes resolve correctly. */
  scope: { contains(scope: string): boolean };
}

export interface AuthorizationRowsToDeauthorizeParams {
  /** Every authorization row the user has. */
  rows: AuthorizationRow[];
  /** The user's refresh tokens after the disconnect's deletes committed. */
  remainingTokens: RemainingRefreshToken[];
  /**
   * Session tokens left after the disconnect committed, or undefined when the
   * caller cannot count them.
   */
  remainingSessions?: number;
  /** The client whose refresh tokens this disconnect destroyed, if any. */
  disconnectedClient?: {
    /** Hex client_id. */
    clientId: string;
    destroyedRefreshTokens: number;
  };
  /**
   * Called with the offending scope when a row's scope will not parse. The row
   * is kept either way; this exists so the caller can count how often it
   * happens, since the case should be unreachable.
   */
  onUnparsableScope?: (scope: string) => void;
}

/**
 * The authorization rows whose own client no longer holds a credential.
 *
 * A row records that a client authorized that scope. A disconnecting client
 * with that scope should not impact the original client's row. Authorization
 * sharing happens on read instead, at the token exchange, by (scope, service):
 * while any row for that pair is active every client benefits, and once the
 * last one is deauthorized the next exchange is denied and the user re-authorizes
 * through whichever client asked, reactivating a row there.
 *
 * A client is still connected while it holds a refresh token covering the
 * scope. Firefox Desktop currently holds none — until it moves to refresh
 * tokens (bz2053654) it destroys the one it is issued immediately — so a native
 * client also counts as connected for as long as any session remains.
 *
 * That session fallback lifts for the client this disconnect acted on.
 * Without the exception a native client's row would outlive every disconnect
 * for as long as the browser stayed signed in. With it, a destroyed refresh
 * token still doesn't deauthorize anything on its own: it only decides rows whose
 * owner is the client that lost it.
 *
 * Client ids are compared lowercased, since callers source them from both hex
 * DB columns and request payloads.
 */
export function authorizationRowsToDeauthorize(
  params: AuthorizationRowsToDeauthorizeParams
): AuthorizationRow[] {
  const {
    rows,
    remainingTokens,
    remainingSessions,
    disconnectedClient,
    onUnparsableScope,
  } = params;

  const tokens = remainingTokens.map((t) => ({
    clientId: t.clientId.toLowerCase(),
    scope: t.scope,
  }));

  // An uncounted session reads as "one remains", the conservative side: a
  // native client's row then falls only when its own refresh token is
  // destroyed.
  const sessionRemains =
    remainingSessions === undefined || remainingSessions > 0;

  // Only a destroy that actually removed a refresh token is evidence of a
  // disconnect.
  const disconnected = disconnectedClient?.destroyedRefreshTokens
    ? disconnectedClient.clientId.toLowerCase()
    : undefined;

  return rows.filter((row) => {
    const owner = row.clientId.toLowerCase();

    try {
      if (
        tokens.some((t) => t.clientId === owner && t.scope.contains(row.scope))
      ) {
        return false;
      }
    } catch {
      // ScopeSet.contains throws on an unparseable scope, and the column is NOT
      // NULL DEFAULT ''. Keep the row rather than let one bad value abort the
      // batch and leave nothing on this account deauthorizable.
      onUnparsableScope?.(row.scope);
      return false;
    }

    if (
      OAUTH_NATIVE_CLIENT_IDS.has(owner) &&
      sessionRemains &&
      owner !== disconnected
    ) {
      return false;
    }

    return true;
  });
}
