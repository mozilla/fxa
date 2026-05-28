/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Path } from 'convict';

import { testDatabaseSetup } from 'fxa-shared/test/db/helpers';
import { Knex } from 'knex';
import config, { AppConfig } from '../config';
import { DatabaseService } from './database.service';
import { MozLoggerService } from '@fxa/shared/mozlog';

describe('#integration - DatabaseService', () => {
  let service: DatabaseService;
  let knex: Knex;

  beforeAll(async () => {
    knex = await testDatabaseSetup();
    // Create inline so a stale fxa-shared:build cache cannot drop the fixture.
    await knex.raw(
      'CREATE TABLE IF NOT EXISTS `accountAuthorizations` (' +
        '`uid` BINARY(16) NOT NULL,' +
        "`scope` VARCHAR(256) NOT NULL DEFAULT '', " +
        "`service` VARCHAR(64) NOT NULL DEFAULT '', " +
        '`clientId` BINARY(8) NOT NULL,' +
        '`firstAuthorizedTosAt` BIGINT UNSIGNED NOT NULL,' +
        '`lastAuthorizedTosAt` BIGINT UNSIGNED NOT NULL,' +
        'PRIMARY KEY (`uid`, `scope`, `service`, `clientId`)' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
  });

  afterAll(async () => {
    await knex.destroy();
  });

  beforeEach(async () => {
    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockImplementation((key: Path<AppConfig>) => {
          const val: any = config.get(key);
          switch (key.toString()) {
            case 'database':
              val.fxa = {
                ...val.fxa_oauth,
                database: 'testAdmin',
              };
              val.fxa_oauth = {
                ...val.fxa_oauth,
                database: 'testAdmin',
              };
              break;
          }

          return val;
        }),
      },
    };
    const logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      trace: jest.fn(),
    };
    const MockMozLoggerService: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    const MockMetricsFactory: Provider = {
      provide: 'METRICS',
      useFactory: () => undefined,
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        MockConfig,
        MockMozLoggerService,
        MockMetricsFactory,
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to invoke authorizedClients', async () => {
    await service.authorizedClients('AB12');
  });

  it('should be able to invoke attachedDevices', async () => {
    await service.attachedDevices('AB12');
  });

  it('returns rows ordered by lastAuthorizedTosAt descending', async () => {
    const uid = 'aabbccddeeff00112233445566778899';
    const uidBuffer = Buffer.from(uid, 'hex');
    const syncClientId = '5882386c6d801776';
    const relayClientId = '9ebfe2c2f9ea3c58';
    const now = Date.now();
    await service.knexOauth('accountAuthorizations').insert([
      {
        uid: uidBuffer,
        scope: 'https://identity.mozilla.com/apps/oldsync',
        service: 'sync',
        clientId: Buffer.from(syncClientId, 'hex'),
        firstAuthorizedTosAt: now - 5000,
        lastAuthorizedTosAt: now - 1000,
      },
      {
        uid: uidBuffer,
        scope: 'https://identity.mozilla.com/apps/relay',
        service: 'relay',
        clientId: Buffer.from(relayClientId, 'hex'),
        firstAuthorizedTosAt: now - 2000,
        lastAuthorizedTosAt: now,
      },
    ]);

    const rows = await service.accountAuthorizations(uid);

    expect(rows).toEqual([
      {
        scope: 'https://identity.mozilla.com/apps/relay',
        service: 'relay',
        clientId: relayClientId,
        firstAuthorizedTosAt: now - 2000,
        lastAuthorizedTosAt: now,
      },
      {
        scope: 'https://identity.mozilla.com/apps/oldsync',
        service: 'sync',
        clientId: syncClientId,
        firstAuthorizedTosAt: now - 5000,
        lastAuthorizedTosAt: now - 1000,
      },
    ]);
  });

  it('returns an empty array when the uid has no authorizations', async () => {
    const rows = await service.accountAuthorizations(
      '00000000000000000000000000000001'
    );
    expect(rows).toEqual([]);
  });
});
