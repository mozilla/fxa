/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { StatsD } from 'hot-shots';
import { DocumentNode } from 'graphql';

import { StatsDService } from '@fxa/shared/metrics/statsd';
import { relyingPartyQuery } from '../../src';
import { RelyingPartyConfigurationManager } from './relying-party-configuration.manager';
import { StrapiClient, StrapiClientEventResponse } from './strapi.client';
import { RelyingPartyQueryFactory } from './queries/relying-party/factories';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStrapiClientConfigProvider } from './strapi.client.config';
import { LOGGER_PROVIDER } from '@fxa/shared/log';

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

// Mock Apollo's getOperationName
jest.mock('@apollo/client/utilities', () => ({
  getOperationName: jest.fn().mockReturnValue('MockOperation'),
}));

describe('RelyingPartyConfigurationManager', () => {
  let relyingPartyConfigurationManager: RelyingPartyConfigurationManager;
  let mockStrapiClient: jest.Mocked<StrapiClient>;
  let mockStatsd: jest.Mocked<StatsD>;
  let mockWinstonLogger: any;

  beforeEach(async () => {
    mockStatsd = {
      timing: jest.fn(),
      increment: jest.fn(),
      gauge: jest.fn(),
    } as any;

    mockStrapiClient = {
      query: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      invalidateQueryCache: jest.fn(),
    } as any;

    mockWinstonLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        RelyingPartyConfigurationManager,
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
        { provide: StatsDService, useValue: mockStatsd },
        { provide: StrapiClient, useValue: mockStrapiClient },
        { provide: LOGGER_PROVIDER, useValue: mockWinstonLogger },
      ],
    }).compile();

    relyingPartyConfigurationManager = module.get(
      RelyingPartyConfigurationManager
    );

    // Get the mock StatsD service from the module
    mockStatsd = module.get(StatsDService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should bind response event listener to StrapiClient', () => {
      expect(mockStrapiClient.on).toHaveBeenCalledWith(
        'response',
        expect.any(Function)
      );
    });
  });

  describe('onStrapiClientResponse', () => {
    it('should log metrics with operation name when query is provided', () => {
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

      relyingPartyConfigurationManager.onStrapiClientResponse(response);

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_accounts_request',
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

    it('should log metrics without operation name when query is not provided', () => {
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

      relyingPartyConfigurationManager.onStrapiClientResponse(response);

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_accounts_request',
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

  describe('fetchCMSData', () => {
    it('should call StrapiClient.query with correct arguments and return data', async () => {
      const mockData = RelyingPartyQueryFactory();
      const clientId = 'test-client-id';
      const entrypoint = 'test-entrypoint';

      mockStrapiClient.query.mockResolvedValue(mockData);

      const result = await relyingPartyConfigurationManager.fetchCMSData(
        clientId,
        entrypoint
      );

      expect(mockStrapiClient.query).toHaveBeenCalledWith(relyingPartyQuery, {
        clientId,
        entrypoint,
      });
      expect(result).toEqual(mockData);
    });

    it('should throw an error if StrapiClient.query fails', async () => {
      const clientId = 'test-client-id';
      const entrypoint = 'test-entrypoint';
      const error = new Error('Query failed');

      mockStrapiClient.query.mockRejectedValue(error);

      await expect(
        relyingPartyConfigurationManager.fetchCMSData(clientId, entrypoint)
      ).rejects.toThrow('Query failed');
    });
  });

  describe('invalidateCache', () => {
    it('should call StrapiClient.invalidateQueryCache with correct parameters', async () => {
      const clientId = 'test-client-id';
      const entrypoint = 'test-entrypoint';

      await relyingPartyConfigurationManager.invalidateCache(
        clientId,
        entrypoint
      );
      expect(mockStrapiClient.invalidateQueryCache).toHaveBeenCalledWith(
        relyingPartyQuery,
        { clientId, entrypoint }
      );
    });
  });

  describe('getFtlContent', () => {
    // Mock global fetch for these tests
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should fetch FTL content from URL successfully', async () => {
      const locale = 'en';
      const config = {
        cmsl10n: {
          ftlUrl: {
            template: 'https://example.com/locales/{locale}/cms.ftl',
            timeout: 5000,
          },
        },
      };
      const ftlContent = 'test FTL content';

      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(ftlContent),
      });

      const result = await relyingPartyConfigurationManager.getFtlContent(locale, config);

      expect(result).toBe(ftlContent);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/locales/en/cms.ftl',
        {
          headers: { Accept: 'text/plain' },
          signal: expect.any(AbortSignal),
        }
      );
    });

    it('should return empty string when URL is not configured', async () => {
      const locale = 'en';
      const config = {
        cmsl10n: {
          ftlUrl: {
            template: '',
            timeout: 5000,
          },
        },
      };

      const result = await relyingPartyConfigurationManager.getFtlContent(locale, config);

      expect(result).toBe('');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return empty string when fetch returns 404', async () => {
      const locale = 'fr';
      const config = {
        cmsl10n: {
          ftlUrl: {
            template: 'https://example.com/locales/{locale}/cms.ftl',
            timeout: 5000,
          },
        },
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await relyingPartyConfigurationManager.getFtlContent(locale, config);

      expect(result).toBe('');
    });

    it('should handle fetch errors and emit metrics', async () => {
      const locale = 'en';
      const config = {
        cmsl10n: {
          ftlUrl: {
            template: 'https://example.com/locales/{locale}/cms.ftl',
            timeout: 5000,
          },
        },
      };

      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        relyingPartyConfigurationManager.getFtlContent(locale, config)
      ).rejects.toThrow('Network error');

      // Verify metrics are emitted for errors
      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_ftl_request',
        expect.any(Number),
        undefined,
        {
          method: 'getFtlContent',
          error: 'true',
          cache: 'false',
          locale,
        }
      );
    });
  });

  describe('invalidateFtlCache', () => {
    it('should exist as a method and complete without error', async () => {
      const locale = 'en';

      // The method exists and can be called, but the actual cache clearing
      // is handled by the @CacheClear decorators
      await expect(
        relyingPartyConfigurationManager.invalidateFtlCache(locale)
      ).resolves.toBeUndefined();
    });
  });

  describe('integration with StrapiClient events', () => {
    it('should handle FTL-related response events in metrics', () => {
      const eventHandler = mockStrapiClient.on.mock.calls[0][1];

      const ftlResponse: StrapiClientEventResponse = {
        method: 'cacheFtl',
        requestStartTime: 1000,
        requestEndTime: 1100,
        elapsed: 100,
        cache: true,
        cacheType: 'memory',
      };

      eventHandler(ftlResponse);

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_accounts_request',
        100,
        undefined,
        {
          method: 'cacheFtl',
          error: 'false',
          cache: 'true',
          cacheType: 'memory',
        }
      );
    });
  });
});
