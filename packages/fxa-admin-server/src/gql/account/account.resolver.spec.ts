/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { Knex } from 'knex';

import {
  Account,
  EmailBounce,
  EmailType,
  Email,
  TotpToken,
  RecoveryKey,
  SessionToken,
} from 'fxa-shared/db/models/auth';
import { testDatabaseSetup } from 'fxa-shared/test/db/helpers';
import {
  randomAccount,
  randomEmail,
  randomEmailBounce,
  randomTotp,
  randomRecoveryKey,
  randomSessionToken,
} from 'fxa-shared/test/db/models/auth/helpers';
import { AccountResolver } from './account.resolver';
import { DatabaseService } from 'fxa-admin-server/src/database/database.service';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);
const EMAIL_BOUNCE_1 = randomEmailBounce(USER_1.email);
const TOTP_1 = randomTotp(USER_1);
const RECOVERY_KEY_1 = randomRecoveryKey(USER_1);
const SESSION_TOKEN_1 = randomSessionToken(USER_1);

const USER_2 = randomAccount();

describe('AccountResolver', () => {
  let resolver: AccountResolver;
  let logger: any;
  let knex: Knex;
  let db = {
    account: Account,
    emails: Email,
    emailBounces: EmailBounce,
    emailTypes: EmailType,
    totp: TotpToken,
    recoveryKeys: RecoveryKey,
    sessionTokens: SessionToken,
  };

  beforeAll(async () => {
    knex = await testDatabaseSetup();

    // Load the users in
    db.account = Account.bindKnex(knex);
    db.emails = Email.bindKnex(knex);
    db.emailBounces = EmailBounce.bindKnex(knex);
    db.emailTypes = EmailType.bindKnex(knex);
    db.totp = TotpToken.bindKnex(knex);
    db.recoveryKeys = RecoveryKey.bindKnex(knex);
    db.sessionTokens = SessionToken.bindKnex(knex);
    await (db.account as any).query().insertGraph({
      ...USER_1,
      emails: [EMAIL_1],
    });
    await db.emailBounces.query().insert(EMAIL_BOUNCE_1);
    await db.totp.query().insert(TOTP_1);
    await db.recoveryKeys.query().insert(RECOVERY_KEY_1);
    await db.sessionTokens.query().insert(SESSION_TOKEN_1);
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
        AccountResolver,
        MockMozLogger,
        MockConfig,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    resolver = module.get<AccountResolver>(AccountResolver);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('locates the user by uid', async () => {
    const result = (await resolver.accountByUid(USER_1.uid, 'joe')) as Account;
    expect(result).toBeDefined();
    expect(result.email).toBe(USER_1.email);
    expect(logger.info).toBeCalledTimes(1);
  });

  it('does not locate non-existent users by uid', async () => {
    const result = await resolver.accountByUid(USER_2.uid, 'joe');
    expect(result).toBeUndefined();
    expect(logger.info).toBeCalledTimes(1);
  });

  it('locates the user by email', async () => {
    const result = (await resolver.accountByEmail(
      USER_1.email,
      'joe'
    )) as Account;
    expect(result).toBeDefined();
    expect(result.email).toBe(USER_1.email);
    expect(logger.info).toBeCalledTimes(1);
  });

  it('does not locate non-existent users by email', async () => {
    const result = await resolver.accountByEmail(USER_2.email, 'joe');
    expect(result).toBeUndefined();
    expect(logger.info).toBeCalledTimes(1);
  });

  it('loads emailBounces', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      'joe'
    )) as Account;
    const { emailType: templateName } = await db.emailTypes
      .query()
      .findOne({ id: EMAIL_BOUNCE_1.emailTypeId });
    const result = await resolver.emailBounces(user);
    expect(result).toBeDefined();
    const bounce = result[0];
    const { emailTypeId, ...bounceValues } = EMAIL_BOUNCE_1;
    expect(bounce).toEqual(
      expect.objectContaining({ ...bounceValues, templateName })
    );
  });

  it('loads emails', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      'joe'
    )) as Account;
    const result = await resolver.emails(user);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
  });

  it('loads totp', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      'joe'
    )) as Account;
    const result = await resolver.totp(user);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].uid).toEqual(TOTP_1.uid);
  });

  it('loads recoveryKeys', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      'joe'
    )) as Account;
    const result = await resolver.recoveryKeys(user);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].uid).toEqual(RECOVERY_KEY_1.uid);
  });

  it('loads sessionTokens', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      'joe'
    )) as Account;
    const result = await resolver.sessionTokens(user);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].tokenId).toEqual(SESSION_TOKEN_1.tokenId);
  });
});
