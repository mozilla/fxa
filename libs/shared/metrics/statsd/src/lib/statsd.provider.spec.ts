/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  LegacyMetricsProvider,
  LegacyStatsDProvider,
  StatsDService,
} from './statsd.provider';
import { StatsD } from 'hot-shots';

const mockStatsd = jest.fn();
jest.mock('hot-shots', () => {
  return {
    StatsD: function (...args: any) {
      return mockStatsd(...args);
    },
  };
});

describe('LegacyStatsDProvider', () => {
  let statsd: StatsD;

  const mockConfig = {
    host: 'test',
  };
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'metrics') {
        return mockConfig;
      }
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyStatsDProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    statsd = await module.resolve<StatsD>(StatsDService);
  });

  it('should provide statsd', async () => {
    expect(statsd).toBeDefined();
    expect(mockStatsd).toHaveBeenCalledWith(mockConfig);
  });
});

describe('LegacyMetricsProvider', () => {
  const resolveMetrics = async (host: string) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyMetricsProvider,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue({ host }) },
        },
      ],
    }).compile();
    return module.resolve<StatsD>('METRICS');
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide a real statsd client for the METRICS token', async () => {
    await resolveMetrics('test');
    expect(mockStatsd).toHaveBeenCalledWith({ host: 'test' });
  });

  it('should provide a mock statsd client when host is empty', async () => {
    await resolveMetrics('');
    expect(mockStatsd).toHaveBeenCalledWith({ mock: true });
  });
});
