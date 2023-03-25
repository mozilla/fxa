/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from 'aws-sdk';

import { LoggerModule } from '../logger/logger.module';
import { MozLoggerService } from '../logger/logger.service';
import { SENTRY_CONFIG } from './sentry.constants';
import { SentryService } from './sentry.service';

describe('SentryService', () => {
  let service: SentryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              env: 'development',
              log: { app: 'test' },
            }),
          ],
        }),
      ],
      providers: [
        ConfigService,
        MozLoggerService,
        SentryService,
        {
          provide: SENTRY_CONFIG,
          useValue: {
            sentryConfig: {
              sentry: {
                dsn: '',
                env: '',
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<SentryService>(SentryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
