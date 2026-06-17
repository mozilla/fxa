/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { DocumentNode } from 'graphql';
import { StatsD } from 'hot-shots';

import {
  StrapiClient,
  StrapiClientEventResponse,
  meterBySlugQuery,
  MeterBySlugResultFactory,
  StrapiMeterFactory,
} from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { MeteringConfigurationManager } from './metering-configuration.manager';

jest.mock('@type-cacheable/core', () => {
  const noopDecorator =
    () =>
    (
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) =>
      descriptor;

  const Cacheable = jest.fn(() => noopDecorator);
  const CacheClear = jest.fn(() => noopDecorator);

  const defaultExport = {
    setOptions: jest.fn(),
  };

  return {
    __esModule: true,
    default: defaultExport,
    Cacheable,
    CacheClear,
  };
});

jest.mock('@fxa/shared/db/type-cacheable', () => ({
  MemoryAdapter: jest.fn().mockImplementation(() => ({})),
  FirestoreAdapter: jest.fn().mockImplementation(() => ({})),
  CacheFirstStrategy: jest.fn().mockImplementation(() => ({})),
  AsyncLocalStorageAdapter: jest.fn().mockImplementation(() => ({})),
  StaleWhileRevalidateWithFallbackStrategy: jest
    .fn()
    .mockImplementation(() => ({})),
}));

jest.mock('@apollo/client/utilities', () => ({
  getOperationName: jest.fn().mockReturnValue('MockOperation'),
}));

describe('MeteringConfigurationManager', () => {
  let manager: MeteringConfigurationManager;
  let mockStrapiClient: jest.Mocked<Pick<StrapiClient, 'query' | 'on'>>;
  let mockStatsd: jest.Mocked<Pick<StatsD, 'timing'>>;

  beforeEach(async () => {
    mockStatsd = {
      timing: jest.fn(),
    };

    mockStrapiClient = {
      query: jest.fn(),
      on: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        MeteringConfigurationManager,
        { provide: StatsDService, useValue: mockStatsd },
        { provide: StrapiClient, useValue: mockStrapiClient },
      ],
    }).compile();

    manager = module.get(MeteringConfigurationManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('registers a response event listener on the Strapi client', () => {
      expect(mockStrapiClient.on).toHaveBeenCalledWith(
        'response',
        expect.any(Function)
      );
    });
  });

  describe('onStrapiClientResponse', () => {
    it('records timing with operation name when query is provided', () => {
      const response: StrapiClientEventResponse = {
        method: 'query',
        requestStartTime: 0,
        requestEndTime: 1,
        elapsed: 1,
        cache: false,
        cacheType: 'method',
        query: {} as DocumentNode,
        error: undefined,
      };

      manager.onStrapiClientResponse(response);

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_metering_request',
        1,
        undefined,
        {
          method: 'query',
          error: 'false',
          cache: 'false',
          cacheType: 'method',
          operationName: 'MockOperation',
        }
      );
    });

    it('records timing without operation name when query is not provided', () => {
      const response: StrapiClientEventResponse = {
        method: 'query',
        requestStartTime: 0,
        requestEndTime: 1,
        elapsed: 1,
        cache: true,
        cacheType: 'method',
        query: undefined,
        error: new Error('Test error'),
      };

      manager.onStrapiClientResponse(response);

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_metering_request',
        1,
        undefined,
        {
          method: 'query',
          error: 'true',
          cache: 'true',
          cacheType: 'method',
        }
      );
    });
  });

  describe('getMeterBySlug', () => {
    it('returns the first meter when a match exists', async () => {
      const mockMeter = StrapiMeterFactory();
      const mockResult = MeterBySlugResultFactory({
        meters: [mockMeter],
      });
      mockStrapiClient.query.mockResolvedValue(mockResult);

      const result = await manager.getMeterBySlug('test-slug');

      expect(mockStrapiClient.query).toHaveBeenCalledWith(meterBySlugQuery, {
        slug: 'test-slug',
      });
      expect(result).toEqual(mockMeter);
    });

    it('returns null when no meters match', async () => {
      const mockResult = MeterBySlugResultFactory({ meters: [] });
      mockStrapiClient.query.mockResolvedValue(mockResult);

      const result = await manager.getMeterBySlug('nonexistent-slug');

      expect(mockStrapiClient.query).toHaveBeenCalledWith(meterBySlugQuery, {
        slug: 'nonexistent-slug',
      });
      expect(result).toBeNull();
    });

    it('propagates errors from the Strapi client', async () => {
      const error = new Error('Query failed');
      mockStrapiClient.query.mockRejectedValue(error);

      await expect(manager.getMeterBySlug('test-slug')).rejects.toThrow(
        'Query failed'
      );
    });
  });
});
