/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeClients } from './oauth';

/**
 * Clients whose only durable credential is a session token, so having no
 * refresh token says nothing about whether they are still connected.
 *
 * Firefox Desktop destroys its refresh token right after sign-in (until
 * bz2053654), and sessions carry no client identity, so its rows cannot be
 * deauthorized and stay active until account deletion.
 *
 * Once Desktop keeps its refresh token, new versions are covered by the rule
 * below unchanged, but old versions still have no sustaining token. Delete
 * this set only when session-only Desktop versions are negligible; before
 * that, their rows would be deauthorized on the first unrelated disconnect.
 */
export const SESSION_BACKED_CLIENT_IDS: ReadonlySet<string> = new Set([
  OAuthNativeClients.FirefoxDesktop,
]);

/**
 * The columns the rule judges and the deauthorize write matches on: the PK
 * plus lastAuthorizedTosAt as the optimistic guard. No deauthorizedAt, because
 * callers drop already-deauthorized rows before building these.
 */
export interface AuthorizationRow {
  scope: string;
  service: string;
  clientId: string;
  lastAuthorizedTosAt: number;
}

/** The part of fxa-shared's ScopeSet the rule needs. */
export interface ScopeSetLike {
  contains(scope: string): boolean;
}

export interface RemainingRefreshToken {
  clientId: string;
  /** A ScopeSet, so hierarchical scopes resolve correctly. */
  scope: ScopeSetLike;
}

export interface AuthorizationRowsToDeauthorizeParams {
  /** Every authorization row the user has. */
  rows: AuthorizationRow[];
  /** Hex client_id whose refresh tokens the disconnect removed. */
  disconnectedClientId: string;
  /** The user's refresh tokens after the disconnect's deletes committed. */
  remainingTokens: RemainingRefreshToken[];
  /**
   * Clients trusted to act for a service: the /authorization write allowlist.
   * Their covering tokens sustain the service's rows too, because a browser
   * that reached VPN through token exchange holds a covering token but never
   * wrote a row of its own. Undefined for a service means own-client only,
   * which keeps web RP rows (no service) from being sustained by every
   * browser's `profile` token.
   */
  allowedClientsForService?: (
    service: string
  ) => ReadonlySet<string> | undefined;
}

/**
 * The authorization rows this disconnect left unsustained.
 *
 * A row is sustained by a covering token from its own client, or from any
 * client on its service's allowlist. Consent is read per (uid, scope, service)
 * at the token exchange and sign-in, so it is "in use" while any trusted client
 * still holds the scope, whichever client showed the ToS. Once the last such
 * token is gone the user re-authorizes through whichever client asks next.
 *
 * Only rows the disconnected client could have been sustaining are judged. The
 * disconnect removed no other client's tokens, so every other row keeps the
 * answer it already had, and judging it would blame this disconnect for a token
 * lost somewhere else entirely — a password reset, say.
 *
 * Row and token client ids are compared lowercased, since callers source them
 * from both hex DB columns and request payloads. Allowlist ids arrive lowercased
 * from config.
 */
export function authorizationRowsToDeauthorize({
  rows,
  disconnectedClientId,
  remainingTokens,
  allowedClientsForService,
}: AuthorizationRowsToDeauthorizeParams): AuthorizationRow[] {
  const disconnected = disconnectedClientId.toLowerCase();
  const tokens = remainingTokens.map((t) => ({
    clientId: t.clientId.toLowerCase(),
    scope: t.scope,
  }));

  return rows.filter((row) => {
    const owner = row.clientId.toLowerCase();

    if (SESSION_BACKED_CLIENT_IDS.has(owner)) {
      return false;
    }

    // The column is NOT NULL DEFAULT ''. Nothing can cover an empty scope, and
    // ScopeSet.contains('') throws, so keep the row rather than judge it.
    if (!row.scope) {
      return false;
    }

    const trusted = allowedClientsForService?.(row.service);

    if (owner !== disconnected && !trusted?.has(disconnected)) {
      return false;
    }

    return !tokens.some(
      (t) =>
        (t.clientId === owner || trusted?.has(t.clientId)) &&
        t.scope.contains(row.scope)
    );
  });
}
