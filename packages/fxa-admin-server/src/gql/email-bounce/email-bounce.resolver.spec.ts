/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'fxa-admin-server/src/database/database.service';
import { Account, EmailBounce } from 'fxa-shared/db/models/auth';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { testDatabaseSetup } from 'fxa-shared/test/db/helpers';
import {
  randomAccount,
  randomEmail,
  randomEmailBounce,
} from 'fxa-shared/test/db/models/auth/helpers';
import { Knex } from 'knex';
import { EventLoggingService } from '../../event-logging/event-logging.service';

import { EmailBounceResolver } from './email-bounce.resolver';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);
const EMAIL_BOUNCE_1 = randomEmailBounce(USER_1.email);

describe('EmailBounceResolver', () => {
  let resolver: EmailBounceResolver;
  let logger: any;
  let knex: Knex;
  let db = {
    account: Account,
    emailBounces: EmailBounce,
  };

  beforeAll(async () => {
    knex = await testDatabaseSetup();
    db.emailBounces = EmailBounce.bindKnex(knex);
    db.account = Account.bindKnex(knex);

    // Load the users in
    await (db.account as any).query().insertGraph({
      ...USER_1,
      emails: [EMAIL_1],
    });
    await db.emailBounces.query().insert(EMAIL_BOUNCE_1);
  });

  beforeEach(async () => {
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue({ authHeader: 'test' }),
      },
    };
    const MockMetricsFactory: Provider = {
      provide: 'METRICS',
      useFactory: () => undefined,
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailBounceResolver,
        EventLoggingService,
        MockMozLogger,
        MockConfig,
        MockMetricsFactory,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    resolver = module.get<EmailBounceResolver>(EmailBounceResolver);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should clear email bounces', async () => {
    const result = await resolver.clearEmailBounce(USER_1.email, 'test');
    expect(result).toBeTruthy();
    expect(logger.info).toBeCalledTimes(2);
  });
});
