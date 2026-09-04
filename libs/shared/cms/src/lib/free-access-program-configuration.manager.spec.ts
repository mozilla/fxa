/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StatsD } from 'hot-shots';

import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider, StatsDService } from '@fxa/shared/metrics/statsd';

import {
  deriveCacheTimingTags,
  FreeAccessProgramConfigurationManager,
} from './free-access-program-configuration.manager';
import { StrapiClient } from './strapi.client';
import { MockStrapiClientConfigProvider } from './strapi.client.config';

// Decorators are pass-through in unit tests: the cache layer is
// exercised in integration, not here. Mirrors strapi.client.spec.ts.
jest.mock('@type-cacheable/core', () => {
  const noopDecorator =
    () =>
    (_target: any, _key: string | symbol, descriptor: PropertyDescriptor) =>
      descriptor;
  return {
    __esModule: true,
    default: { setOptions: jest.fn() },
    Cacheable: jest.fn(() => noopDecorator),
    CacheClear: jest.fn(() => noopDecorator),
  };
});

jest.mock('@fxa/shared/db/type-cacheable', () => ({
  MemoryAdapter: jest.fn().mockImplementation(() => ({})),
  FirestoreAdapter: jest.fn().mockImplementation(() => ({})),
  CacheFirstStrategy: jest.fn().mockImplementation(() => ({})),
  StaleWhileRevalidateWithFallbackStrategy: jest
    .fn()
    .mockImplementation(() => ({})),
}));

describe('FreeAccessProgramConfigurationManager', () => {
  let manager: FreeAccessProgramConfigurationManager;
  let strapiClient: { queryUncached: jest.Mock };
  let mockStatsd: StatsD;

  beforeEach(async () => {
    strapiClient = { queryUncached: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        { provide: StrapiClient, useValue: strapiClient },
        {
          provide: Logger,
          useValue: { error: jest.fn(), log: jest.fn(), warn: jest.fn() },
        },
        FreeAccessProgramConfigurationManager,
      ],
    }).compile();
    manager = moduleRef.get(FreeAccessProgramConfigurationManager);
    mockStatsd = moduleRef.get(StatsDService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCachedProjection', () => {
    it('returns the projection of the Strapi accesses query', async () => {
      strapiClient.queryUncached.mockResolvedValue({
        accesses: [
          {
            documentId: 'ent-1',
            internalName: 'VPN',
            offerings: [
              {
                apiIdentifier: 'vpn',
                capabilities: [
                  { slug: 'vpn', services: [{ oauthClientId: 'client-a' }] },
                ],
              },
            ],
            matchers: [
              {
                __typename: 'ComponentMatchersEmailList',
                emails: { 'Alice@Example.com': ['2099-01-01', 'VIP'] },
              },
            ],
          },
        ],
      });

      const result = await manager.getCachedProjection();

      expect(strapiClient.queryUncached).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        'alice@example.com': {
          capabilities: { 'client-a': ['vpn'] },
          offeringApiIdentifiers: ['vpn'],
        },
      });
    });

    it('returns an empty projection when Strapi returns no accesses', async () => {
      strapiClient.queryUncached.mockResolvedValue({ accesses: [] });
      await expect(manager.getCachedProjection()).resolves.toEqual({});
    });

    it('propagates errors from the Strapi client', async () => {
      strapiClient.queryUncached.mockRejectedValue(new Error('strapi-down'));
      await expect(manager.getCachedProjection()).rejects.toThrow(
        'strapi-down'
      );
    });
  });

  describe('getFreshProjection', () => {
    it('returns the projection of the Strapi accesses query', async () => {
      strapiClient.queryUncached.mockResolvedValue({
        accesses: [
          {
            documentId: 'ent-1',
            internalName: 'VPN',
            offerings: [
              {
                apiIdentifier: 'vpn',
                capabilities: [
                  { slug: 'vpn', services: [{ oauthClientId: 'client-a' }] },
                ],
              },
            ],
            matchers: [
              {
                __typename: 'ComponentMatchersEmailList',
                emails: { 'bob@example.com': ['2099-01-01', ''] },
              },
            ],
          },
        ],
      });

      const result = await manager.getFreshProjection();

      expect(strapiClient.queryUncached).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        'bob@example.com': {
          capabilities: { 'client-a': ['vpn'] },
          offeringApiIdentifiers: ['vpn'],
        },
      });
    });

    it('emits a fresh cms_free_access_request timing', async () => {
      jest.spyOn(mockStatsd, 'timing');
      strapiClient.queryUncached.mockResolvedValue({ accesses: [] });

      await manager.getFreshProjection();

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_free_access_request',
        expect.any(Number),
        undefined,
        {
          method: 'query',
          operationName: 'freeAccessProgramProjection',
          error: 'false',
          cache: 'false',
          cacheType: 'fresh',
        }
      );
    });

    it('does not emit the timing when the fetch fails', async () => {
      jest.spyOn(mockStatsd, 'timing');
      strapiClient.queryUncached.mockRejectedValue(new Error('strapi-down'));

      await expect(manager.getFreshProjection()).rejects.toThrow('strapi-down');
      expect(mockStatsd.timing).not.toHaveBeenCalled();
    });

    it('propagates errors from the Strapi client', async () => {
      strapiClient.queryUncached.mockRejectedValue(new Error('strapi-down'));
      await expect(manager.getFreshProjection()).rejects.toThrow(
        'strapi-down'
      );
    });
  });

  describe('getCachedAccessGrantsByClient', () => {
    it('returns the per-client access grants of the Strapi accesses query', async () => {
      strapiClient.queryUncached.mockResolvedValue({
        accesses: [
          {
            documentId: 'ent-1',
            internalName: 'VPN + Relay',
            offerings: [
              {
                apiIdentifier: 'vpn',
                capabilities: [
                  { slug: 'vpn', services: [{ oauthClientId: 'client-a' }] },
                ],
              },
              {
                apiIdentifier: 'relay',
                capabilities: [
                  { slug: 'relay', services: [{ oauthClientId: 'client-b' }] },
                ],
              },
            ],
            matchers: [
              {
                __typename: 'ComponentMatchersEmailList',
                emails: { 'user@example.com': ['2099-01-01', ''] },
              },
            ],
          },
        ],
      });

      const result = await manager.getCachedAccessGrantsByClient();

      expect(strapiClient.queryUncached).toHaveBeenCalledTimes(1);
      // Each client sees only its own offering — never the other's.
      expect(result).toEqual({
        'user@example.com': {
          'client-a': [
            { offeringApiIdentifier: 'vpn', expiresAt: Date.UTC(2099, 0, 2) },
          ],
          'client-b': [
            { offeringApiIdentifier: 'relay', expiresAt: Date.UTC(2099, 0, 2) },
          ],
        },
      });
    });

    it('propagates errors from the Strapi client', async () => {
      strapiClient.queryUncached.mockRejectedValue(new Error('strapi-down'));
      await expect(manager.getCachedAccessGrantsByClient()).rejects.toThrow(
        'strapi-down'
      );
    });
  });

  describe('invalidateProjectionCache', () => {
    it('resolves without throwing (decorators stripped in unit context)', async () => {
      await expect(
        manager.invalidateProjectionCache()
      ).resolves.toBeUndefined();
    });
  });

  describe('recordCacheTiming', () => {
    it('emits a cms_free_access_request timing for a memory hit', () => {
      jest.spyOn(mockStatsd, 'timing');

      manager.recordCacheTiming('freeAccessProgramProjection', 'memory', 12, 'cache');

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_free_access_request',
        12,
        undefined,
        {
          method: 'query',
          operationName: 'freeAccessProgramProjection',
          error: 'false',
          cache: 'true',
          cacheType: 'memory',
        }
      );
    });

    it('emits a stringified error/cache tag for a Firestore fallback', () => {
      jest.spyOn(mockStatsd, 'timing');

      manager.recordCacheTiming(
        'freeAccessProgramAccessGrantsByClient',
        'firestore',
        34,
        'fallback'
      );

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_free_access_request',
        34,
        undefined,
        {
          method: 'query',
          operationName: 'freeAccessProgramAccessGrantsByClient',
          error: 'true',
          cache: 'true',
          cacheType: 'fallback',
        }
      );
    });

    it('does not emit for a memory miss (recorded by the Firestore tier instead)', () => {
      jest.spyOn(mockStatsd, 'timing');

      manager.recordCacheTiming('freeAccessProgramProjection', 'memory', 5, 'method');

      expect(mockStatsd.timing).not.toHaveBeenCalled();
    });
  });
});

describe('deriveCacheTimingTags', () => {
  it('tags a memory hit as a non-error cache hit', () => {
    expect(deriveCacheTimingTags('memory', 'cache')).toEqual({
      error: false,
      cache: true,
      cacheType: 'memory',
    });
  });

  it('returns null for a memory miss so it is not double-counted', () => {
    expect(deriveCacheTimingTags('memory', 'method')).toBeNull();
  });

  it.each([
    { result: 'method', error: false, cache: false },
    { result: 'stale', error: false, cache: true },
    { result: 'fallback', error: true, cache: true },
    { result: 'fallbackFailed', error: true, cache: false },
  ])(
    'maps Firestore result "$result" to error=$error cache=$cache',
    ({ result, error, cache }) => {
      expect(deriveCacheTimingTags('firestore', result)).toEqual({
        error,
        cache,
        cacheType: result,
      });
    }
  );
});
