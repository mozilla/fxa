/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  RateLimitClient,
  RateLimitProvider,
  RateLimitRedisClient,
} from './rate-limit.provider';
import { RateLimit } from './rate-limit';
import { StatsDService } from '../../../../shared/metrics/statsd/src';

const mockStatsd = jest.fn();
jest.mock('hot-shots', () => {
  return {
    StatsD: function (...args: any) {
      return mockStatsd(...args);
    },
  };
});

describe('RateLimitProvider', () => {
  let rateLimit: RateLimit;

  const mockConfig = {
    rules: ['test : ip : 1 : 1 second : 1 second '],
  };
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'rateLimit') {
        return mockConfig;
      }
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RateLimitRedisClient,
          useValue: {},
        },
        {
          provide: StatsDService,
          useValue: {},
        },
      ],
    }).compile();

    rateLimit = await module.resolve<RateLimit>(RateLimitClient);
  });

  it('should provide statsd', async () => {
    expect(rateLimit).toBeDefined();
  });
});
