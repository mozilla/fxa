/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Deauthorization on disconnect: sets deauthorizedAt on accountAuthorizations
// rows no trusted refresh token sustains any more. The row and its ToS
// timestamps stay; the token-exchange gate stops treating it as consent until
// the user re-authorizes, which reactivates it.
//
// The rule lives in authorizationRowsToDeauthorize (@fxa/accounts/oauth). This
// module feeds it the disconnected client, which scopes the rows it judges,
// plus the rows and remaining refresh tokens, both read after the caller's own
// delete committed — which is what makes Settings' parallel sign-outs safe:
// the last one to run sees the true final state.
//
// Reached from Connected Services disconnect (POST
// /account/attached_client/destroy) and device disconnect.
// Session sign-outs never reach it: deleting a session token does not touch
// fxa_oauth.refreshTokens, so it cannot change any row's outcome.
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
  type ScopeSetLike,
} from '@fxa/accounts/oauth';

import { AuthLogger } from '../types';

export interface DeauthorizeOnDisconnectOauthDB {
  listAccountConsentsByUid(uid: string): Promise<
    Array<{
      scope: string;
      service: string;
      clientId: Buffer | string;
      lastAuthorizedTosAt: number | string;
      deauthorizedAt: number | string | null;
    }>
  >;
  getRefreshTokenScopesByUid(uid: string): Promise<
    Array<{
      clientId: Buffer | string;
      scope: ScopeSetLike;
    }>
  >;
  /** The /authorization write allowlist for a service, if it has one. */
  allowedClientsForService(service: string): ReadonlySet<string> | undefined;
  /** Resolves to the number of rows actually deauthorized. */
  deauthorizeAccountAuthorizations(
    uid: string,
    rows: AuthorizationRow[],
    deauthorizedAt: number
  ): Promise<number>;
}

export interface DeauthorizeOnDisconnectDeps {
  oauthDB: DeauthorizeOnDisconnectOauthDB;
  // Callers omit these; they resolve from the container, like redis.js and
  // db.ts do. Injectable so unit tests can assert on them.
  statsd?: Pick<StatsD, 'increment'>;
  log?: Pick<Logger, 'warn'>;
}

export interface DeauthorizeOnDisconnectParams {
  uid: string;
  /**
   * Hex client_id whose refresh tokens this destroy removed. Scopes which rows
   * the pass judges, and buckets the metrics. Absent means the caller removed
   * nothing, so no row's answer can have changed.
   */
  clientId?: string;
}

const hex = (v: Buffer | string): string =>
  typeof v === 'string' ? v : v.toString('hex');

// Tagging the raw client_id would give the metric one value per registered RP,
// so bucket to the distinction that matters.
function clientType(clientId?: string): 'native' | 'other' | 'unknown' {
  if (!clientId) {
    return 'unknown';
  }
  return OAUTH_NATIVE_CLIENT_IDS.has(clientId.toLowerCase())
    ? 'native'
    : 'other';
}

export async function deauthorizeOnDisconnect(
  deps: DeauthorizeOnDisconnectDeps,
  { uid, clientId }: DeauthorizeOnDisconnectParams
): Promise<void> {
  const statsd =
    deps.statsd ?? (Container.has(StatsD) ? Container.get(StatsD) : undefined);
  const log =
    deps.log ??
    (Container.has(AuthLogger) ? Container.get(AuthLogger) : undefined);
  const client_type = clientType(clientId);

  if (!clientId) {
    statsd?.increment('accountAuthorization.deauthorize_noop', { client_type });
    return;
  }

  const attempt = async () => {
    // Rows first, then refresh tokens — not in parallel. An authorization
    // committing between the two then appears as a token with no row (inert)
    // rather than a row with no token (would deauthorize a fresh grant).
    // Already-deauthorized rows are dropped here rather than sent: the SQL
    // guard would skip them anyway, and it keeps the IN list to live rows.
    const rows = (await deps.oauthDB.listAccountConsentsByUid(uid)).filter(
      (r) => r.deauthorizedAt == null
    );
    const refreshTokens = await deps.oauthDB.getRefreshTokenScopesByUid(uid);

    const toDeauthorize = authorizationRowsToDeauthorize({
      disconnectedClientId: clientId,
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
      allowedClientsForService: (s) => deps.oauthDB.allowedClientsForService(s),
    });

    const deauthorized = toDeauthorize.length
      ? await deps.oauthDB.deauthorizeAccountAuthorizations(
          uid,
          toDeauthorize,
          Date.now()
        )
      : 0;
    // 0 is the common case (owner still connected, or nothing authorized).
    statsd?.increment(
      deauthorized > 0
        ? 'accountAuthorization.deauthorized'
        : 'accountAuthorization.deauthorize_noop',
      { client_type }
    );
  };

  // One immediate retry: nothing else revisits these rows, so a failure here
  // is terminal. Safe because attempt() re-reads and decides on fresh state.
  for (let i = 0; i < 2; i++) {
    try {
      await attempt();
      return;
    } catch (err) {
      if (i === 0) {
        statsd?.increment('accountAuthorization.deauthorize_retried', {
          client_type,
        });
        continue;
      }
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
