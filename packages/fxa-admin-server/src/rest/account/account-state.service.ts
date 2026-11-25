/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { NotifierService } from '@fxa/shared/notifier';
import { ProfileClient } from '@fxa/profile/client';
import { SecurityEventNames } from '@fxa/shared/db/mysql/legacy/models/auth/security-event';
import { AppConfig } from '../../config';
import { DatabaseService } from '../../database/database.service';
import { uuidTransformer } from '../../database/transformers';
import type { DisableMatchingJob } from '../../types';

/** How many `emails` ids one scan query covers. */
const SCAN_RANGE = 10_000;

/** Exact domains are matched in SQL; a predicate runs here on every primary email. */
export type AccountMatch =
  | { domains: string[] }
  | { test: (normalizedEmail: string) => boolean };

export type DisableMatchingProgress = Pick<
  DisableMatchingJob,
  'scanned' | 'total' | 'disabled'
>;

/** The parts of a request that a security event records. A background scan outlives the request itself. */
export type RequestOrigin = Pick<Request, 'headers' | 'ip'>;

@Injectable()
export class AccountStateService {
  constructor(
    private db: DatabaseService,
    private configService: ConfigService<AppConfig>,
    private notifier: NotifierService,
    @Inject(ProfileClient) private profileClient: ProfileClient
  ) {}

  public async disable(uid: string, req: RequestOrigin) {
    const uidBuffer = uuidTransformer.to(uid);
    // Revoke before flagging: a revocation failure then leaves the account
    // enabled and retryable, rather than disabled with live credentials
    // that a later enable would reactivate.
    await this.db.revokeAccountTokens(uid);
    const result = await this.db.account
      .query()
      .update({ disabledAt: Date.now() })
      .where('uid', uidBuffer);
    if (!result) {
      return false;
    }

    await this.recordStateChange(uid, 'account.disable', req);
    return true;
  }

  /**
   * Disables each enabled account whose primary email matches; returns the count.
   * Walks `emails` in id ranges, so every query is bounded however large the table is.
   * `onProgress` runs after each range and each disabled account; an error from it stops the scan.
   */
  public async disableMatching(
    match: AccountMatch,
    req: RequestOrigin,
    onProgress?: (progress: DisableMatchingProgress) => Promise<void>
  ): Promise<number> {
    const newest = (await this.db.knex('emails').max('id as maxId').first()) as
      | { maxId: number | null }
      | undefined;
    const total = Number(newest?.maxId ?? 0);
    let disabled = 0;
    for (let from = 0; from < total; from += SCAN_RANGE) {
      const to = Math.min(from + SCAN_RANGE, total);
      // accounts.normalizedEmail keeps the signup email after a primary email change.
      const query = this.db
        .knex('emails')
        .select('emails.uid', 'emails.normalizedEmail')
        .join('accounts', 'accounts.uid', 'emails.uid')
        .where('emails.id', '>', from)
        .where('emails.id', '<=', to)
        .where('emails.isPrimary', true)
        .whereNull('accounts.disabledAt');
      if ('domains' in match) {
        const placeholders = match.domains.map(() => '?').join(', ');
        query.whereRaw(
          `SUBSTRING_INDEX(emails.normalizedEmail, '@', -1) IN (${placeholders})`,
          match.domains
        );
      }
      const rows: Array<{ uid: Buffer; normalizedEmail: string }> = await query;
      for (const row of rows) {
        if ('test' in match && !match.test(row.normalizedEmail)) {
          continue;
        }
        if (await this.disable(uuidTransformer.from(row.uid), req)) {
          disabled++;
          await onProgress?.({ scanned: from, total, disabled });
        }
      }
      await onProgress?.({ scanned: to, total, disabled });
    }
    return disabled;
  }

  // Best effort: the account state is already written, so a failed audit
  // event, cache clear or notification must not fail the completed action.
  public async recordStateChange(
    uid: string,
    event: SecurityEventNames,
    req: RequestOrigin
  ) {
    const results = await Promise.allSettled([
      this.writeSecurityEvent(uid, event, req),
      this.profileClient.deleteCache(uid),
      this.notifier.send({
        event: 'profileDataChange',
        data: {
          ts: Date.now() / 1000,
          uid,
        },
      }),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        Sentry.captureException(result.reason, { extra: { uid, event } });
      }
    }
  }

  public async writeSecurityEvent(
    uid: string,
    name: SecurityEventNames,
    req: RequestOrigin
  ) {
    const result = await this.db.securityEvents.create({
      uid,
      name,
      ipAddr: (req.headers['x-forwarded-for'] as string) || req.ip || '',
      ipHmacKey: this.configService.get('ipHmacKey') as AppConfig['ipHmacKey'],
      additionalInfo: {
        userAgent: req.headers['user-agent'],
        adminPanelAction: true,
      },
    });
    return !!result;
  }
}
