/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Knex from 'knex';

import { AppConfig } from '../config';
import { Account, EmailBounces, Emails } from './model';

@Injectable()
export class DatabaseService {
  public knex: Knex;
  public account: typeof Account;
  public emails: typeof Emails;
  public emailBounces: typeof EmailBounces;

  constructor(configService: ConfigService<AppConfig>) {
    const dbConfig = configService.get('database') as AppConfig['database'];
    this.knex = Knex({ connection: dbConfig, client: 'mysql' });
    this.account = Account.bindKnex(this.knex);
    this.emails = Emails.bindKnex(this.knex);
    this.emailBounces = EmailBounces.bindKnex(this.knex);
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
