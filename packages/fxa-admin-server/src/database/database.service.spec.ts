/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from './database.service';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue({
          database: {
            database: 'testAdmin',
            host: 'localhost',
            password: '',
            port: 3306,
            user: 'root',
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
});
