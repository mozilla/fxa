/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { RateLimitClient } from '@fxa/accounts/rate-limit';
import { EventLoggingService } from '../../event-logging/event-logging.service';
import { RateLimitingResolver } from './rate-limiting.resolver';
import { BlockStatus } from '../model/block-status.model';

describe('RateLimitingResolver', () => {
  let resolver: RateLimitingResolver;
  let logger: any;
  let rateLimit: any;

  const mockBlockStatus: BlockStatus = {
    retryAfter: 3600,
    reason: 'too-many-attempts',
    action: 'login',
    blockingOn: 'ip',
    startTime: Date.now() - 5000,
    duration: 3600,
    attempt: 3,
    policy: 'block',
  };

  beforeEach(async () => {
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    rateLimit = { search: jest.fn() };

    const MockMozLoggerService: Provider = {
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

    const MockRateLimit: Provider = {
      provide: RateLimitClient,
      useValue: rateLimit,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitingResolver,
        EventLoggingService,
        MockMozLoggerService,
        MockConfig,
        MockMetricsFactory,
        MockRateLimit,
      ],
    }).compile();

    resolver = module.get<RateLimitingResolver>(RateLimitingResolver);
  });

  describe('rateLimits', () => {
    it('should return rate limits for IP address', async () => {
      const testIp = '192.168.1.1';
      rateLimit.search.mockResolvedValue([mockBlockStatus]);

      const result = await resolver.rateLimits('testUser', testIp);

      expect(result).toEqual([mockBlockStatus]);
      expect(rateLimit.search).toHaveBeenCalledWith(
        testIp,
        undefined,
        undefined
      );
      expect(logger.info).toHaveBeenCalledWith('rateLimits', {
        user: 'testUser',
        query: { ip: testIp, email: undefined, uid: undefined },
      });
    });
  });
});
