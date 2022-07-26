/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Path } from 'convict';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import config, { AppConfig } from '../config';
import { DatabaseService } from './database.service';

describe.skip('DatabaseService', () => {
  let service: DatabaseService;
  let logger: any;

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
    const MockLogService: Provider = {
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
        MockLogService,
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

  it('should be able to invoke relyingParties', async () => {
    await service.relyingParties();
  });
});
