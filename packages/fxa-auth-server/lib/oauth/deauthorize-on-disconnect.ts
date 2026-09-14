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
import { Container } from 'typedi';

import {
  authorizationRowsToDeauthorize,
  OAUTH_NATIVE_CLIENT_IDS,
  type AuthorizationRow,
} from '@fxa/accounts/oauth';

import { AuthLogger } from '../types';

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
    rows: AuthorizationRow[]
  ): Promise<number>;
}

export interface DeauthorizeOnDisconnectDeps {
  oauthDB: DeauthorizeOnDisconnectOauthDB;
  /**
   * fxa-db, for counting the sessions left. Callers without one (the bare
   * oauth route) omit it, which the policy reads as "one remains".
   */
  db?: { sessions(uid: string): Promise<unknown[]> };
  // Fall back to the container when omitted; both are unregistered in most
  // unit tests, where the fallback yields undefined.
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
}

const hex = (v: Buffer | string): string =>
  typeof v === 'string' ? v : v.toString('hex');

// Tagging the raw client_id would give the metric one value per registered RP,
// so bucket to the distinction that matters.
function clientType(clientId?: string): 'native' | 'other' | 'session' {
  if (!clientId) {
    return 'session';
  }
  return OAUTH_NATIVE_CLIENT_IDS.has(clientId.toLowerCase())
    ? 'native'
    : 'other';
}

export async function deauthorizeOnDisconnect(
  deps: DeauthorizeOnDisconnectDeps,
  { uid, clientId, destroyedRefreshTokens }: DeauthorizeOnDisconnectParams
): Promise<void> {
  const statsd =
    deps.statsd ?? (Container.has(StatsD) ? Container.get(StatsD) : undefined);
  const log =
    deps.log ??
    (Container.has(AuthLogger) ? Container.get(AuthLogger) : undefined);
  const client_type = clientType(clientId);

  const attempt = async () => {
    // Authorization rows first, then refresh tokens — not in parallel. An
    // authorization that commits between the two then shows up as a refresh
    // token we have no row for, which is inert, rather than a row whose
    // sustaining refresh token we missed, which would deauthorize an authorization
    // the user just granted.
    const rows = await deps.oauthDB.listAccountConsentsByUid(uid);
    const refreshTokens = await deps.oauthDB.getRefreshTokenScopesByUid(uid);
    const remainingSessions = deps.db
      ? (await deps.db.sessions(uid)).length
      : undefined;

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
      // Only a destroy that actually removed a refresh token is evidence of a
      // disconnect.
      disconnectedClientId: destroyedRefreshTokens ? clientId : undefined,
    });

    const deauthorized = toDeauthorize.length
      ? await deps.oauthDB.deauthorizeAccountAuthorizations(uid, toDeauthorize)
      : 0;
    // 0 is the common case: the owner is still connected, or there was nothing
    // authorized to begin with. Counted separately so the two can be told
    // apart without inferring it from a rate.
    statsd?.increment(
      deauthorized > 0
        ? 'accountAuthorization.deauthorized'
        : 'accountAuthorization.deauthorize_noop',
      { client_type }
    );
  };

  try {
    await attempt();
  } catch {
    // One immediate retry. Nothing else revisits these rows, so a failure here
    // is terminal rather than recoverable on the next request, and Settings'
    // parallel disconnects can contend on the same rows. Safe because the
    // sequence re-reads: the second attempt decides on fresh state.
    statsd?.increment('accountAuthorization.deauthorize_retried', {
      client_type,
    });
    try {
      await attempt();
    } catch (err) {
      statsd?.increment('accountAuthorization.deauthorize_failed', {
        client_type,
      });
      // Message only, never the error object: it can carry query text.
      log?.warn('accountAuthorization.deauthorize_failed', {
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
