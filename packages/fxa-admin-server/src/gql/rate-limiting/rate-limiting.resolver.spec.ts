/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { RateLimitClient } from '@fxa/accounts/rate-limit';
import { EventLoggingService } from '../../event-logging/event-logging.service';
import { AuditLogInterceptor } from '../../auth/audit-log.interceptor';
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
    rateLimit = {
      search: jest.fn(),
      searchAndClear: jest.fn(),
    };

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
        AuditLogInterceptor,
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
      expect(rateLimit.search).toHaveBeenCalledWith({
        ip: testIp,
        email: undefined,
        uid: undefined,
      });
      expect(logger.info).toHaveBeenCalledWith('rateLimits', {
        user: 'testUser',
        query: { ip: testIp, email: undefined, uid: undefined },
      });
    });
  });

  describe('clear', () => {
    it('should clear IP address and return count', async () => {
      const testIp = '192.168.1.1';
      rateLimit.searchAndClear.mockResolvedValue(5);

      const result = await resolver.clearRateLimits('testUser', testIp);

      expect(result).toBe(5);
      expect(rateLimit.searchAndClear).toHaveBeenCalledWith({
        ip: testIp,
        email: undefined,
        uid: undefined,
      });
      expect(logger.info).toHaveBeenCalledWith('clear', {
        user: 'testUser',
        ip: testIp,
        email: undefined,
        uid: undefined,
      });
    });

    it('should clear with email and uid', async () => {
      const testEmail = 'test@example.com';
      const testUid = 'user123';
      rateLimit.searchAndClear.mockResolvedValue(2);

      const result = await resolver.clearRateLimits(
        'testUser',
        undefined,
        testEmail,
        testUid
      );

      expect(result).toBe(2);
      expect(rateLimit.searchAndClear).toHaveBeenCalledWith({
        ip: undefined,
        email: testEmail,
        uid: testUid,
      });
      expect(logger.info).toHaveBeenCalledWith('clear', {
        user: 'testUser',
        ip: undefined,
        email: testEmail,
        uid: testUid,
      });
    });

    it('should clear with multiple parameters', async () => {
      const testIp = '192.168.1.1';
      const testEmail = 'test@example.com';
      rateLimit.searchAndClear.mockResolvedValue(3);

      const result = await resolver.clearRateLimits(
        'testUser',
        testIp,
        testEmail
      );

      expect(result).toBe(3);
      expect(rateLimit.searchAndClear).toHaveBeenCalledWith({
        ip: testIp,
        email: testEmail,
        uid: undefined,
      });
      expect(logger.info).toHaveBeenCalledWith('clear', {
        user: 'testUser',
        ip: testIp,
        email: testEmail,
        uid: undefined,
      });
    });
  });
});
