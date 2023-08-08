/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { setupAuthDatabase, setupProfileDatabase } from 'fxa-shared/db';
import { Account } from 'fxa-shared/db/models/auth';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { StatsD } from 'hot-shots';
import { Knex } from 'knex';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { setupAccountDatabase } from '@fxa/shared/db/mysql/account';
import { AppConfig } from '../config';

@Injectable()
export class DatabaseService {
  public authKnex: Knex;
  public profileKnex: Knex;
  public accountKnex: Knex;

  constructor(
    configService: ConfigService<AppConfig>,
    logger: MozLoggerService,
    @Inject('METRICS') metrics: StatsD
  ) {
    const dbConfig = configService.get('database') as AppConfig['database'];
    this.authKnex = setupAuthDatabase(dbConfig.mysql.auth, logger, metrics);
    this.profileKnex = setupProfileDatabase(
      dbConfig.mysql.profile,
      logger,
      metrics
    );
    this.accountKnex = setupAccountDatabase(
      dbConfig.mysql.auth,
      logger,
      metrics
    );
  }

  async dbHealthCheck(): Promise<Record<string, any>> {
    let status = 'ok';
    try {
      await Account.query().limit(1);
    } catch (err) {
      status = 'error';
    }
    return {
      db: { status },
    };
  }
}
