/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Consent revocation on sign-out / disconnect. The token-exchange gate denies
// when no accountAuthorizations row exists, so deleting one returns the user to a
// pre-authorization state. Denial is not a dead end: FxA prompts and the user
// re-consents, which writes a row for whichever client asked.
//
// A row belongs to the client that accepted the ToS, and only that client's own
// credentials decide whether it survives — see consentRowsToRevoke in
// @fxa/accounts/oauth for the rule and its reasoning. This module supplies the
// three facts it needs, all read after the caller's own delete committed:
// the rows, the remaining refresh tokens, and how many sessions are left.
//
// Reading after our own delete is what makes Settings' parallel sign-outs safe.
// It fires one request per client sharing a display name, so several land at
// once; each sees only its own delete plus whatever else has committed, and the
// last to run sees the true final state.
//
// Errors are swallowed and counted: the user's tokens are already gone and they
// cannot retry, so bookkeeping must never fail a disconnect.

import { OAUTH_NATIVE_CLIENT_IDS } from '@fxa/accounts/oauth';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';

import { consentRowsToRevoke, type ConsentRow } from '@fxa/accounts/oauth';

export interface RevokeConsentsOnDisconnectOauthDB {
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
  /** Resolves to the number of rows actually removed. */
  deleteAccountConsentRows(uid: string, rows: ConsentRow[]): Promise<number>;
}

export interface RevokeConsentsOnDisconnectDeps {
  oauthDB: RevokeConsentsOnDisconnectOauthDB;
  // Only the methods this module uses, picked from the real collaborator types
  // so a minimal mock satisfies them without re-declaring the contract.
  statsd?: Pick<StatsD, 'increment'>;
  log?: Pick<Logger, 'warn'>;
}

export interface RevokeConsentsOnDisconnectParams {
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

// One immediate retry. Nothing else revisits these rows, so unlike most writes a
// failure here is terminal rather than recoverable on the next request. Not gated
// on error code, since the sequence is idempotent and retrying re-reads, so the
// second attempt decides on fresh state.
const ATTEMPTS = 2;

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

export async function revokeConsentsOnDisconnect(
  deps: RevokeConsentsOnDisconnectDeps,
  params: RevokeConsentsOnDisconnectParams
): Promise<void> {
  const { uid, clientId, destroyedRefreshTokens, remainingSessions } = params;
  if (!uid) {
    return;
  }

  const client_type = clientType(clientId);
  const disconnectedClient = clientId
    ? { clientId, destroyedRefreshTokens: destroyedRefreshTokens ?? 0 }
    : undefined;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      // Consents first, then tokens — not in parallel. An authorization that
      // commits between the two then shows up as a token we have no row for,
      // which is inert, rather than a row whose sustaining token we missed,
      // which would revoke consent the user just granted.
      const consentRows = await deps.oauthDB.listAccountConsentsByUid(uid);
      const tokens = await deps.oauthDB.getRefreshTokenScopesByUid(uid);

      const toRevoke = consentRowsToRevoke({
        rows: consentRows.map((r) => ({
          scope: r.scope,
          service: r.service,
          clientId: hex(r.clientId),
          lastAuthorizedTosAt: Number(r.lastAuthorizedTosAt),
        })),
        remainingTokens: tokens.map((t) => ({
          clientId: hex(t.clientId),
          scope: t.scope,
        })),
        remainingSessions,
        disconnectedClient,
      });

      const rows = toRevoke.length
        ? await deps.oauthDB.deleteAccountConsentRows(uid, toRevoke)
        : 0;
      // 0 is the common case: the owner is still connected, or there was no
      // consent to begin with. Counted separately from a revocation so the two
      // can be told apart without inferring it from a rate.
      deps.statsd?.increment(
        rows > 0
          ? 'accountAuthorization.revoked'
          : 'accountAuthorization.revoke_noop',
        { client_type }
      );
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (attempt < ATTEMPTS) {
        // Counted rather than logged: paired against revoke_failed, this shows
        // how often the retry is what saved the revocation.
        deps.statsd?.increment('accountAuthorization.revoke_retried', {
          client_type,
        });
        continue;
      }
      deps.statsd?.increment('accountAuthorization.revoke_failed', {
        client_type,
      });
      // Message only, never the error object: it can carry query text.
      deps.log?.warn('accountAuthorization.revoke_failed', { err: message });
    }
  }
}
