/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { knex, Knex } from 'knex';

import { AppConfig } from '../config';
import {
  Account,
  EmailBounces,
  Emails,
  Totp,
  RecoveryKeys,
  SessionTokens,
  SecurityEvents,
} from './model';

function typeCasting(field: any, next: any) {
  if (field.type === 'TINY' && field.length === 1) {
    return field.string() === '1';
  }
  return next();
}

@Injectable()
export class DatabaseService {
  public knex: Knex;
  public account: typeof Account;
  public emails: typeof Emails;
  public emailBounces: typeof EmailBounces;
  public securityEvents: typeof SecurityEvents;
  public totp: typeof Totp;
  public recoveryKeys: typeof RecoveryKeys;
  public sessionTokens: typeof SessionTokens;

  constructor(configService: ConfigService<AppConfig>) {
    const dbConfig = configService.get('database') as AppConfig['database'];
    this.knex = knex({
      connection: { typeCast: typeCasting, ...dbConfig },
      client: 'mysql',
    });
    this.account = Account.bindKnex(this.knex);
    this.emails = Emails.bindKnex(this.knex);
    this.emailBounces = EmailBounces.bindKnex(this.knex);
    this.securityEvents = SecurityEvents.bindKnex(this.knex);
    this.totp = Totp.bindKnex(this.knex);
    this.recoveryKeys = RecoveryKeys.bindKnex(this.knex);
    this.sessionTokens = SessionTokens.bindKnex(this.knex);
  }

  async dbHealthCheck(): Promise<Record<string, any>> {
    let status = 'ok';
    try {
      await this.account.query().limit(1);
    } catch (err) {
      status = 'error';
    }
    return {
      db: { status },
    };
  }
}
