/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from './database.service';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account } from 'fxa-shared/db/models/auth';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const dbConfig = {
      database: 'testAdmin',
      host: 'localhost',
      password: '',
      port: 3306,
      user: 'root',
      connectionLimitMin: 2,
      connectionLimitMax: 10,
      acquireTimeoutMillis: 30000,
    };
    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue({
          mysql: {
            auth: dbConfig,
            profile: dbConfig,
          },
        }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService, MockConfig],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns success', async () => {
    (jest.spyOn(Account, 'query') as jest.Mock).mockReturnValue({
      limit: jest.fn().mockResolvedValue({}),
    });
    const result = await service.dbHealthCheck();
    expect(result).toStrictEqual({ db: { status: 'ok' } });
  });

  it('returns error', async () => {
    (jest.spyOn(Account, 'query') as jest.Mock).mockReturnValue({
      limit: jest.fn().mockRejectedValue({}),
    });
    const result = await service.dbHealthCheck();
    expect(result).toStrictEqual({ db: { status: 'error' } });
  });
});
