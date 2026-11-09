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

const MATCH_BATCH_SIZE = 1000;

@Injectable()
export class AccountStateService {
  constructor(
    private db: DatabaseService,
    private configService: ConfigService<AppConfig>,
    private notifier: NotifierService,
    @Inject(ProfileClient) private profileClient: ProfileClient
  ) {}

  public async disable(uid: string, req: Request) {
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

  /** Disables each enabled account whose primary email passes `matches`; returns the count. */
  public async disableMatching(
    matches: (normalizedEmail: string) => boolean,
    req: Request
  ) {
    let disabled = 0;
    let lastUid: string | undefined;
    while (true) {
      // accounts.normalizedEmail keeps the signup email after a primary email change.
      const query = this.db.account
        .query()
        .select('accounts.uid', 'emails.normalizedEmail')
        .join('emails', 'emails.uid', 'accounts.uid')
        .where('emails.isPrimary', true)
        .whereNull('accounts.disabledAt')
        .orderBy('accounts.uid')
        .limit(MATCH_BATCH_SIZE);
      if (lastUid) {
        query.where('accounts.uid', '>', uuidTransformer.to(lastUid));
      }
      const accounts = await query;
      for (const account of accounts) {
        if (
          matches(account.normalizedEmail) &&
          (await this.disable(account.uid, req))
        ) {
          disabled++;
        }
      }
      if (accounts.length < MATCH_BATCH_SIZE) {
        return disabled;
      }
      lastUid = accounts[accounts.length - 1].uid;
    }
  }

  // Best effort: the account state is already written, so a failed audit
  // event, cache clear or notification must not fail the completed action.
  public async recordStateChange(
    uid: string,
    event: SecurityEventNames,
    req: Request
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
    req: Request
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
