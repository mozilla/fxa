/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'node:crypto';
import type { StatsD } from 'hot-shots';
import * as isA from 'joi';
import { AppError } from '@fxa/accounts/errors';
import type { SecurityEventNames } from '@fxa/shared/db/mysql/legacy/models/auth/security-event';
import type { ConfigType } from '../../config';
import ACCOUNT_DOCS from '../../docs/swagger/account-api';
import type { GleanMetricsType } from '../metrics/glean';
import { sign as signOAuthJwt } from '../oauth/jwt';
import { reportSentryError } from '../sentry';
import { hasPasswordReauth } from '../tokens/session-reauth';
import type { AuthRequest, SessionTokenAuthCredential } from '../types';
import type { Customs, DB } from './passkeys';
import { recordSecurityEvent } from './utils/security-event';

/** MFA action the client must have verified; the token scope is `mfa:sync_data`. */
export const SYNC_DATA_MFA_SCOPE = 'sync_data';

/**
 * Tokenserver verifies the assertion with the FxA OAuth JWKs. `typ` and `aud`
 * mark it as a tokenserver-admin credential (its OAuth token path accepts
 * only `typ: at+jwt`, so it cannot double as a Sync access token); `scope`
 * names the one admin operation it authorizes.
 */
export const ADMIN_ASSERTION_TYP = 'tokenserver-admin+jwt';
export const ADMIN_ASSERTION_AUDIENCE = 'urn:mozilla:fxa:tokenserver';
export const DELETE_ASSERTION_SCOPE = 'sync_data:delete';
/** The assertion is used within milliseconds; tokenserver's own cap is 120s. */
const DELETE_ASSERTION_TTL_SEC = 30;
/** Tokenserver bounds the whole delete at 60s; 2s headroom lets its timeout response reach us. */
const REQUEST_TIMEOUT_MS = 62_000;

const CUSTOMS_ACTION = 'syncDataDestroy';
/**
 * Tagged `result:deleted|nothing_to_delete|failed`; failures also carry
 * `reason:timeout|connect|http_<status>|malformed_body`.
 */
const STATSD_METRIC = 'sync_data.destroy';
/** Round-trip time of the tokenserver call, success or not. */
const STATSD_TIMING = 'sync_data.destroy.tokenserver';

export class SyncDataHandler {
  constructor(
    private readonly config: ConfigType,
    private readonly db: DB,
    private readonly customs: Customs,
    private readonly glean: GleanMetricsType,
    private readonly statsd: StatsD
  ) {}

  /**
   * Handles `POST /account/sync_data/destroy`.
   *
   * Asks tokenserver to delete every Sync collection for the account. The
   * account keeps syncing afterwards if the user does not turn Sync off or
   * sign out of syncing devices; only the stored data is gone.
   *
   * Requires an `mfa:sync_data` token on a session that has re-entered its
   * password via /session/reauth (Security review SA-1022).
   *
   * @returns `{ deleted: boolean }` — false when the user had no Sync data to
   *   delete (never synced, or no storage node assigned).
   */
  async destroy(request: AuthRequest) {
    const session = request.auth.credentials as SessionTokenAuthCredential;
    const { uid } = session;
    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.primaryEmail.email,
      CUSTOMS_ACTION
    );

    if (!hasPasswordReauth(session)) {
      // No dedicated "password reauth required" error exists yet; passkey
      // wraps reuses this one for the same check. Adding one is FXA-14847.
      throw AppError.invalidMfaToken();
    }

    let deleted: boolean;
    try {
      deleted = await this.deleteFromTokenserver(uid);
    } catch (err) {
      this.statsd.increment(STATSD_METRIC, [
        'result:failed',
        `reason:${(err as { reason?: string }).reason ?? 'unknown'}`,
      ]);
      throw err;
    }
    this.statsd.increment(STATSD_METRIC, [
      `result:${deleted ? 'deleted' : 'nothing_to_delete'}`,
    ]);

    // Only when data was actually destroyed; a user with nothing stored
    // leaves no audit trail.
    if (deleted) {
      await this.recordEvent(request, 'account.sync_data_deleted');
      this.glean.syncData.deleteSuccess(request);
    }
    return { deleted };
  }

  private async deleteFromTokenserver(uid: string): Promise<boolean> {
    // syncTokenserverUrl is the oldsync token endpoint; the delete endpoint
    // lives on the same origin.
    const url = new URL(
      `/1.0/users/${uid}/storage`,
      this.config.syncTokenserverUrl
    );
    const assertion = await signOAuthJwt(
      {
        sub: uid,
        aud: ADMIN_ASSERTION_AUDIENCE,
        scope: DELETE_ASSERTION_SCOPE,
        jti: crypto.randomUUID(),
      },
      {
        expiresIn: DELETE_ASSERTION_TTL_SEC,
        header: { typ: ADMIN_ASSERTION_TYP },
      }
    );

    // `reason` rides on the error so destroy() can tag the failure metric.
    const failure = (reason: string, cause?: Error) =>
      Object.assign(
        AppError.backendServiceFailure(
          'tokenserver',
          'deleteSyncData',
          { reason },
          cause
        ),
        { reason }
      );

    const startedAt = Date.now();
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${assertion}` },
        redirect: 'error',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      this.statsd.timing(STATSD_TIMING, Date.now() - startedAt);
      const reason =
        (err as Error).name === 'TimeoutError' ? 'timeout' : 'connect';
      throw failure(reason, err as Error);
    }
    this.statsd.timing(STATSD_TIMING, Date.now() - startedAt);

    if (res.status === 200) {
      let body: unknown;
      try {
        body = await res.json();
      } catch (err) {
        throw failure('malformed_body', err as Error);
      }
      const deleted = (body as { deleted?: unknown } | null)?.deleted;
      if (typeof deleted !== 'boolean') {
        throw failure('malformed_body');
      }
      return deleted;
    }
    // Unread bodies hold the connection until garbage collection.
    await res.body?.cancel();
    // No tokenserver record: the account never synced or has been retired.
    if (res.status === 404) {
      return false;
    }
    throw failure(`http_${res.status}`);
  }

  private async recordEvent(request: AuthRequest, name: SecurityEventNames) {
    try {
      await recordSecurityEvent(name, { db: this.db, request });
    } catch (err) {
      reportSentryError(err, request);
    }
  }
}

export const syncDataRoutes = (
  customs: Customs,
  db: DB,
  config: ConfigType,
  log: any,
  glean: GleanMetricsType,
  statsd: StatsD
) => {
  const handler = new SyncDataHandler(config, db, customs, glean, statsd);
  const enabledCheck = () => {
    if (!config.syncDataDeletion.enabled) {
      throw AppError.featureNotEnabled();
    }
    return true;
  };

  return [
    {
      method: 'POST',
      path: '/account/sync_data/destroy',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_SYNC_DATA_DESTROY_POST,
        pre: [{ method: enabledCheck }],
        auth: {
          strategy: 'mfa',
          scope: [`mfa:${SYNC_DATA_MFA_SCOPE}`],
          payload: false,
        },
        response: {
          schema: isA.object({
            deleted: isA.boolean().required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('Account.syncDataDestroy', request);
        return handler.destroy(request);
      },
    },
  ];
};
