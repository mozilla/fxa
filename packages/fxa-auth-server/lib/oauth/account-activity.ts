/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Fire-and-forget writer for the accountActivity liveness signal (FXA-13662).
// Each OAuth grant produces one accountActivity row per (userId, clientId,
// scopeId). scopeId is resolved from the scopes table; a grant with no scopes
// records one row against the empty-string scope. Consumers identify the RP via
// the clientId column (JOIN clients.name for the human-readable name) and the
// scope via scopeId (JOIN scopes.scope).

import * as Sentry from '@sentry/node';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';

export interface ScopeSetLike {
  getScopeValues(): Iterable<string>;
}

export interface AccountActivityOauthDB {
  recordAccountActivity(
    userId: Buffer | string,
    clientId: Buffer | string,
    scopes: string[],
    now: number,
    throttleMs: number
  ): Promise<{
    /** Requested scopes absent from the scopes table; no row was written for them. */
    missingScopes: string[];
  }>;
}

export interface AccountActivityDeps {
  oauthDB: AccountActivityOauthDB;
  // Only the methods this module uses, picked from the real collaborator types
  // so a minimal mock satisfies them without re-declaring the contract.
  statsd?: Pick<StatsD, 'increment'>;
  log?: Pick<Logger, 'warn'>;
}

export interface RecordActivityParams {
  userId: Buffer | string;
  clientId: Buffer | string;
  scopeSet: ScopeSetLike | null | undefined;
  /** Throttle window in ms; lastSeenAt is only updated if the existing row was last touched longer than this ago. */
  throttleMs: number;
  /** For metric tagging. */
  grantType?: string;
  /** For test determinism. */
  now?: number;
}

const hex = (v: Buffer | string): string =>
  Buffer.isBuffer(v) ? v.toString('hex') : v;

function extractScopes(scopeSet: ScopeSetLike | null | undefined): string[] {
  if (!scopeSet || typeof scopeSet.getScopeValues !== 'function') return [];
  return Array.from(scopeSet.getScopeValues()).filter(
    (scope) => typeof scope === 'string' && scope.length > 0
  );
}

/**
 * Fire-and-forget write of an accountActivity row per resolved scope for a
 * single OAuth grant.
 *
 * Never throws. Never blocks the response. On DB failure, increments
 * `accountActivity.write_failed` and reports to Sentry; the grant still
 * succeeds.
 *
 * Scopes missing from the scopes table are skipped (resolved ones still write)
 * and counted via `accountActivity.missing_scopes` {clientId, grantType} and
 * `accountActivity.missing_scope` {scope}, plus a warning log naming them.
 *
 * Returns the awaited Promise so tests can assert on completion; the OAuth
 * grant path does not await it.
 */
export async function recordActivity(
  deps: AccountActivityDeps,
  params: RecordActivityParams
): Promise<void> {
  const { oauthDB, statsd, log } = deps;
  const {
    userId,
    clientId,
    scopeSet,
    throttleMs,
    grantType,
    now = Date.now(),
  } = params;

  // Grant validation upstream guarantees clientId is in the OAuth clients
  // table, so the metric tag's cardinality is naturally bounded (matches the
  // sibling oauth.rp.keys-jwe metric in token.js). No separate allowlist
  // pass needed.
  const clientIdHex = hex(clientId);
  const scopes = extractScopes(scopeSet);
  const metricTags = {
    clientId: clientIdHex,
    grantType: grantType || 'unknown',
  };

  try {
    const { missingScopes } = await oauthDB.recordAccountActivity(
      userId,
      clientId,
      scopes,
      now,
      throttleMs
    );
    statsd?.increment('accountActivity.recorded', metricTags);

    if (missingScopes && missingScopes.length > 0) {
      // Split metrics keep cardinality additive, not multiplicative: one
      // per-grant event by {clientId, grantType}, one per-scope event by {scope}.
      statsd?.increment('accountActivity.missing_scopes', metricTags);
      for (const scope of missingScopes) {
        statsd?.increment('accountActivity.missing_scope', { scope });
      }
      log?.warn('accountActivity.missing_scopes', {
        clientId: clientIdHex,
        grantType,
        missingScopes,
      });
    }
  } catch (err) {
    statsd?.increment('accountActivity.write_failed', metricTags);
    Sentry.captureException(
      err instanceof Error ? err : new Error(String(err)),
      {
        tags: { clientId: clientIdHex, grantType: grantType || 'unknown' },
        extra: { scopes },
      }
    );
  }
}
