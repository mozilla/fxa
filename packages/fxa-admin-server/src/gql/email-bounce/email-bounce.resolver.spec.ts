/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import Knex from 'knex';

import { Account, EmailBounces } from '../../database/model';
import {
  randomAccount,
  randomEmail,
  randomEmailBounce,
  testDatabaseSetup,
} from '../../database/model/helpers';
import { EmailBounceResolver } from './email-bounce.resolver';
import { DatabaseService } from 'fxa-admin-server/src/database/database.service';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);
const EMAIL_2 = randomEmail(USER_1, true);
const EMAIL_BOUNCE_1 = randomEmailBounce(USER_1.email);

describe('EmailBounceResolver', () => {
  let resolver: EmailBounceResolver;
  let logger: any;
  let knex: Knex;
  let db = {
    account: Account,
    emailBounces: EmailBounces,
  };

  beforeAll(async () => {
    knex = await testDatabaseSetup('testAdminEmailResolver');
    db.emailBounces = EmailBounces.bindKnex(knex);
    db.account = Account.bindKnex(knex);

    // Load the users in
    await (db.account as any).query().insertGraph({
      ...USER_1,
      emails: [EMAIL_1, EMAIL_2],
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailBounceResolver,
        MockMozLogger,
        MockConfig,
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
    expect(logger.info).toBeCalledTimes(1);
  });
});
