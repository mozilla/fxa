/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAUTH_NATIVE_CLIENT_IDS } from './oauth';

/** A consent row, as stored in accountAuthorizations. */
export interface ConsentRow {
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

export interface ConsentRowsToRevokeParams {
  /** Every consent row the user has. */
  rows: ConsentRow[];
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
}

/**
 * Consent rows whose own client no longer holds a credential.
 *
 * A row records that one client accepted the ToS, so only that client's state
 * decides its fate — a peer disconnecting says nothing about it. Sharing happens
 * on read instead: the exchange gate omits clientId, so while any row for the
 * (scope, service) survives, every client benefits. Once the last one goes the
 * next exchange is denied, and the user simply re-consents on whichever client
 * asked, which writes a row there.
 *
 * A client is still connected while it holds a refresh token covering the scope.
 * Firefox Desktop holds none — it discards its token right after sign-in — so a
 * native client also counts as connected while any session remains. That
 * protection has to lift for a client we just disconnected, or destroying its
 * refresh token would never withdraw anything while the browser stayed signed in.
 *
 * Client ids are compared lowercased, since callers source them from both hex
 * DB columns and request payloads.
 */
export function consentRowsToRevoke(
  params: ConsentRowsToRevokeParams
): ConsentRow[] {
  const { rows, remainingTokens, remainingSessions, disconnectedClient } =
    params;

  const tokens = remainingTokens.map((t) => ({
    clientId: t.clientId.toLowerCase(),
    scope: t.scope,
  }));

  // An uncounted session reads as "one remains", the conservative side: a native
  // client's consent then falls only to its own token being destroyed.
  const sessionRemains =
    remainingSessions === undefined || remainingSessions > 0;

  // Only a destroy that actually removed a token is evidence of a disconnect.
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
      // batch and leave this account permanently un-revocable.
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
