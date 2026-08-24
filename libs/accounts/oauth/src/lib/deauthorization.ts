/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeClients } from './oauth';

/**
 * Clients whose only durable credential is a session token, so a refresh token
 * says nothing about whether they are still connected.
 *
 * Firefox Desktop destroys the refresh token it is issued immediately after
 * sign-in and holds none until bz2053654. Sessions carry no client identity, so
 * there is no signal that distinguishes "this Desktop disconnected" from "some
 * session on the account ended" — which means Desktop's rows cannot be
 * deauthorized at all, and stay active until the account is deleted. This set
 * is deleted once Desktop holds refresh tokens; the rule below then covers it
 * with no other change.
 */
export const SESSION_BACKED_CLIENT_IDS: ReadonlySet<string> = new Set([
  OAuthNativeClients.FirefoxDesktop,
]);

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
   * Called with the offending scope when a row's scope will not parse. The row
   * is kept either way; this exists so the caller can count how often it
   * happens, since the case should be unreachable.
   */
  onUnparsableScope?: (scope: string) => void;
}

/**
 * The authorization rows whose own client no longer holds a refresh token.
 *
 * A row records that a client authorized that scope. A disconnecting client
 * with that scope should not impact the original client's row. Authorization
 * sharing happens on read instead, at the token exchange, by (scope, service):
 * while any row for that pair is active every client benefits, and once the
 * last one is deauthorized the next exchange is denied and the user
 * re-authorizes through whichever client asked, reactivating a row there.
 *
 * A refresh token is the whole test. It is the credential the exchange spends,
 * so a client that has none cannot use the row it owns, and one that holds a
 * covering token demonstrably still can. Nothing here reads session state:
 * deleting a session token does not touch fxa_oauth.refreshTokens, so it cannot
 * change the answer.
 *
 * Client ids are compared lowercased, since callers source them from both hex
 * DB columns and request payloads.
 */
export function authorizationRowsToDeauthorize(
  params: AuthorizationRowsToDeauthorizeParams
): AuthorizationRow[] {
  const { rows, remainingTokens, onUnparsableScope } = params;

  const tokens = remainingTokens.map((t) => ({
    clientId: t.clientId.toLowerCase(),
    scope: t.scope,
  }));

  return rows.filter((row) => {
    const owner = row.clientId.toLowerCase();

    if (SESSION_BACKED_CLIENT_IDS.has(owner)) {
      return false;
    }

    try {
      return !tokens.some(
        (t) => t.clientId === owner && t.scope.contains(row.scope)
      );
    } catch {
      // ScopeSet.contains throws on an unparseable scope, and the column is NOT
      // NULL DEFAULT ''. Keep the row rather than let one bad value abort the
      // batch and leave nothing on this account deauthorizable.
      onUnparsableScope?.(row.scope);
      return false;
    }
  });
}
