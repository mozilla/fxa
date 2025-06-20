/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CMSManager, CMSManagerConfig } from './cms-manager';
import { CMSConfigFetchError, StrapiConfigNotFoundError, StrapiFetchError } from './error';
import { StrapiClientConfig } from './strapi.client';
import fetchMock from 'fetch-mock';

interface PartialRedis {
  get: jest.Mock<Promise<string | null>, [key: string]>;
  set: jest.Mock<Promise<string | undefined>, [key: string, value: string, mode?: string, duration?: number]>;
  del: jest.Mock<Promise<number>, [key: string]>;
}

describe('CMSManager', () => {
  const apiUrl = 'https://api.example.com';
  const apiKey = 'valid-token';
  const clientId = 'test-client';
  const entrypoint = 'test-entrypoint';
  const prefix = 'cmsaccounts:';
  const cacheTTL = 3600;
  const config: CMSManagerConfig = {
    enabled: true,
    cacheTTL,
    strapiClient: { apiUrl, apiKey },
  };
  const apiUrlPattern = new RegExp(
    `${apiUrl.replace('.', '\\.')}/api/clients\\?populate=\\*|%2A&filters%5BclientId%5D=${clientId}&filters%5Bentrypoint%5D=${entrypoint}`
  );
  const cacheKey = `${prefix}${clientId}:${entrypoint}`;

  let redis: PartialRedis;
  let statsd: { increment: jest.Mock };
  let cmsManager: CMSManager;

  beforeEach(() => {
    statsd = { increment: jest.fn() };
    redis = {
      get: jest.fn(),
      set: jest.fn(() => Promise<any>),
      del: jest.fn(),
    } as any;

    fetchMock.reset();
    cmsManager = new CMSManager(config, redis as any, statsd as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fetchMock.restore();
  });

  describe('constructor', () => {
    it('should initialize with valid config, redis, and statsd', () => {
      expect(cmsManager).toBeInstanceOf(CMSManager);
    });
  });

  describe('getConfig', () => {
    const mockConfig: StrapiClientConfig = {
      id: 1,
      clientId,
      entrypoint,
      EmailFirstPage: { headline: 'Test', description: 'Description' },
    };

    it('should return undefined if disabled', async () => {
      const disabledConfig = { ...config, enabled: false };
      const disabledManager = new CMSManager(disabledConfig, redis as any, statsd as any);
      const result = await disabledManager.getConfig(clientId, entrypoint);
      expect(result).toBeUndefined();
      expect(statsd.increment).not.toHaveBeenCalled();
      expect(fetchMock.called(apiUrlPattern)).toBe(false);
    });

    it('should return cached configuration', async () => {
      redis.get.mockResolvedValueOnce(JSON.stringify(mockConfig));

      const result = await cmsManager.getConfig(clientId, entrypoint);

      expect(result).toEqual(mockConfig);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.cache_hit.${clientId}.${entrypoint}`);
      expect(statsd.increment).not.toHaveBeenCalledWith(`cms_manager.cache_miss.${clientId}.${entrypoint}`);
      expect(fetchMock.called(apiUrlPattern)).toBe(false);
    });

    it('should fetch from Strapi on cache miss and cache result', async () => {
      fetchMock.get({ url: apiUrlPattern, matchPartialBody: true }, {
        status: 200,
        body: { data: [mockConfig] },
      });

      const result = await cmsManager.getConfig(clientId, entrypoint);

      expect(result).toEqual(mockConfig);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.cache_miss.${clientId}.${entrypoint}`);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.strapi_fetch_success.${clientId}.${entrypoint}`);
      expect(fetchMock.called(apiUrlPattern)).toBe(true);
      const requestOptions = fetchMock.lastCall()?.[1];
      expect(requestOptions?.headers).toBeInstanceOf(Headers);
      expect((requestOptions?.headers as Headers).get('Authorization')).toBe(`Bearer ${apiKey}`);

      expect(redis.set).toHaveBeenCalledWith('cmsaccounts:test-client:test-entrypoint', JSON.stringify(mockConfig), 'EX', cacheTTL);
    });

    it('should handle Redis get error and fetch from Strapi', async () => {
      redis.get.mockRejectedValueOnce(new Error('Redis get error'));
      fetchMock.get({ url: apiUrlPattern, matchPartialBody: true }, {
        status: 200,
        body: { data: [mockConfig] },
      });

      const result = await cmsManager.getConfig(clientId, entrypoint);

      expect(result).toEqual(mockConfig);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.cache_error.${clientId}.${entrypoint}`);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.strapi_fetch_success.${clientId}.${entrypoint}`);
      expect(fetchMock.called(apiUrlPattern)).toBe(true);
    });

    it('should handle Redis set error and return config', async () => {
      redis.set.mockRejectedValueOnce(new Error('Redis error'));
      fetchMock.get({ url: apiUrlPattern, matchPartialBody: true }, {
        status: 200,
        body: { data: [mockConfig] },
      });

      const result = await cmsManager.getConfig(clientId, entrypoint);

      expect(result).toEqual(mockConfig);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.cache_miss.${clientId}.${entrypoint}`);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.strapi_fetch_success.${clientId}.${entrypoint}`);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.cache_set_error.${clientId}.${entrypoint}`);
    });

    it('should re-throw StrapiFetchError', async () => {
      fetchMock.get({ url: apiUrlPattern, matchPartialBody: true }, {
        status: 404,
        body: 'Not Found',
      });

      await expect(cmsManager.getConfig(clientId, entrypoint)).rejects.toThrow(
        new StrapiFetchError(clientId, entrypoint)
      );
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.cache_miss.${clientId}.${entrypoint}`);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.error.${clientId}.${entrypoint}`);
    });

    it('should re-throw StrapiConfigNotFoundError', async () => {
      fetchMock.get({ url: apiUrlPattern, matchPartialBody: true }, {
        status: 200,
        body: { data: [] },
      });

      await expect(cmsManager.getConfig(clientId, entrypoint)).rejects.toThrow(
        new StrapiConfigNotFoundError(clientId, entrypoint)
      );
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.cache_miss.${clientId}.${entrypoint}`);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.error.${clientId}.${entrypoint}`);
    });

    it('should wrap non-Strapi errors in CMSConfigFetchError', async () => {
      fetchMock.get({ url: apiUrlPattern, matchPartialBody: true }, () => {
        throw new Error('Network error');
      });

      await expect(cmsManager.getConfig(clientId, entrypoint)).rejects.toThrow(
        new CMSConfigFetchError(clientId, entrypoint, new Error('Network error'))
      );
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.cache_miss.${clientId}.${entrypoint}`);
      expect(statsd.increment).toHaveBeenCalledWith(`cms_manager.error.${clientId}.${entrypoint}`);
    });
  });

  describe('clearCache', () => {
    it('should clear cache for clientId and entrypoint', async () => {
      await cmsManager.clearCache(clientId, entrypoint);
      expect(redis.del).toHaveBeenCalledWith(cacheKey);
    });

    it('should handle Redis error silently', async () => {
      redis.del.mockRejectedValueOnce(new Error('Redis error'));
      await expect(cmsManager.clearCache(clientId, entrypoint)).resolves.toBeUndefined();
    });
  });
});