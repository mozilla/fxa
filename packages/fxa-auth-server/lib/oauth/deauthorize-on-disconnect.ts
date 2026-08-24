/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Deauthorization on sign-out / disconnect. The token-exchange gate denies
// when no active accountAuthorizations row exists, so setting deauthorizedAt
// returns the user to a pre-authorization state while the row itself, and the
// ToS timestamps on it, stay on record. Denial is not a dead end: FxA prompts
// and the user re-authorizes, which reactivates the row for whichever client
// asked.
//
// A row belongs to the client that authorized the scope, and only that client's
// own credentials decide whether it survives — see
// authorizationRowsToDeauthorize in @fxa/accounts/oauth for the rule and its
// reasoning. This module supplies the three facts it needs, all read after the
// caller's own delete committed: the rows, the remaining refresh tokens, and
// how many sessions are left.
//
// Reading after our own delete is what makes Settings' parallel sign-outs safe.
// It fires one request per client sharing a display name, so several land at
// once; each sees only its own delete plus whatever else has committed, and the
// last to run sees the true final state.
//
// Errors are swallowed and counted: the user's tokens are already gone and they
// cannot retry, so bookkeeping must never fail a disconnect.

import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';

import {
  authorizationRowsToDeauthorize,
  OAUTH_NATIVE_CLIENT_IDS,
  type AuthorizationRow,
} from '@fxa/accounts/oauth';

export interface DeauthorizeOnDisconnectOauthDB {
  listAccountConsentsByUid(uid: string): Promise<
    Array<{
      scope: string;
      service: string;
      clientId: Buffer | string;
      lastAuthorizedTosAt: number | string;
    }>
  >;
  getRefreshTokenScopesByUid(uid: string): Promise<
    Array<{
      clientId: Buffer | string;
      scope: { contains(scope: string): boolean };
    }>
  >;
  /** Resolves to the number of rows actually deauthorized. */
  deauthorizeAccountAuthorizations(
    uid: string,
    rows: AuthorizationRow[],
    deauthorizedAt: number
  ): Promise<number>;
}

export interface DeauthorizeOnDisconnectDeps {
  oauthDB: DeauthorizeOnDisconnectOauthDB;
  // Only the methods this module uses, picked from the real collaborator types
  // so a minimal mock satisfies them without re-declaring the contract.
  statsd?: Pick<StatsD, 'increment'>;
  log?: Pick<Logger, 'warn'>;
}

export interface DeauthorizeOnDisconnectParams {
  uid: string;
  /**
   * Hex client_id whose refresh tokens this destroy removed. Absent for a plain
   * session sign-out, which carries no client identity.
   */
  clientId?: string;
  /** How many refresh tokens the destroy actually removed. */
  destroyedRefreshTokens?: number;
  /**
   * Sessions left after the sign-out. Undefined where the caller has no fxa-db
   * handle to count them, which the policy reads as "one remains".
   */
  remainingSessions?: number;
}

const hex = (v: Buffer | string): string =>
  typeof v === 'string' ? v : v.toString('hex');

// Tagging the raw client_id would give the metric one value per registered RP,
// so bucket to the distinction that matters.
function clientType(clientId?: string): 'native' | 'other' | 'session' {
  if (!clientId) {
    return 'session';
  }
  return OAUTH_NATIVE_CLIENT_IDS.has(String(clientId).toLowerCase())
    ? 'native'
    : 'other';
}

export async function deauthorizeOnDisconnect(
  deps: DeauthorizeOnDisconnectDeps,
  params: DeauthorizeOnDisconnectParams
): Promise<void> {
  const { uid, clientId, destroyedRefreshTokens, remainingSessions } = params;
  if (!uid) {
    return;
  }

  const client_type = clientType(clientId);
  const disconnectedClient = clientId
    ? { clientId, destroyedRefreshTokens: destroyedRefreshTokens ?? 0 }
    : undefined;

  const attempt = async () => {
    // Authorization rows first, then refresh tokens — not in parallel. An
    // authorization that commits between the two then shows up as a refresh
    // token we have no row for, which is inert, rather than a row whose
    // sustaining refresh token we missed, which would deauthorize an authorization
    // the user just granted.
    const rows = await deps.oauthDB.listAccountConsentsByUid(uid);
    const refreshTokens = await deps.oauthDB.getRefreshTokenScopesByUid(uid);

    const toDeauthorize = authorizationRowsToDeauthorize({
      rows: rows.map((r) => ({
        scope: r.scope,
        service: r.service,
        clientId: hex(r.clientId),
        lastAuthorizedTosAt: Number(r.lastAuthorizedTosAt),
      })),
      remainingTokens: refreshTokens.map((t) => ({
        clientId: hex(t.clientId),
        scope: t.scope,
      })),
      remainingSessions,
      disconnectedClient,
      // Should be unreachable — scope is written by us and validated on the way
      // in. Counted so we find out if it ever isn't, since the row is kept and
      // the account would otherwise silently stop being deauthorizable.
      onUnparsableScope: () =>
        deps.statsd?.increment('accountAuthorization.unparsable_scope', {
          client_type,
        }),
    });

    const deauthorized = toDeauthorize.length
      ? await deps.oauthDB.deauthorizeAccountAuthorizations(
          uid,
          toDeauthorize,
          Date.now()
        )
      : 0;
    // 0 is the common case: the owner is still connected, or there was nothing
    // authorized to begin with. Counted separately so the two can be told
    // apart without inferring it from a rate.
    deps.statsd?.increment(
      deauthorized > 0
        ? 'accountAuthorization.deauthorized'
        : 'accountAuthorization.deauthorize_noop',
      { client_type }
    );
  };

  try {
    await attempt();
  } catch {
    // One immediate retry, no backoff and not gated on error code. Nothing else
    // revisits these rows, so unlike most writes a failure here is terminal
    // rather than recoverable on the next request. Retrying is safe because the
    // sequence re-reads: the second attempt decides on fresh state.
    deps.statsd?.increment('accountAuthorization.deauthorize_retried', {
      client_type,
    });
    try {
      await attempt();
    } catch (err) {
      deps.statsd?.increment('accountAuthorization.deauthorize_failed', {
        client_type,
      });
      // Message only, never the error object: it can carry query text.
      deps.log?.warn('accountAuthorization.deauthorize_failed', {
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
