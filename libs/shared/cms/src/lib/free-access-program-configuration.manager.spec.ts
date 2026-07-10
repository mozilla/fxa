/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MockFirestoreProvider } from '@fxa/shared/db/firestore';

import { FreeAccessProgramConfigurationManager } from './free-access-program-configuration.manager';
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

  beforeEach(async () => {
    strapiClient = { queryUncached: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
        { provide: StrapiClient, useValue: strapiClient },
        {
          provide: Logger,
          useValue: { error: jest.fn(), log: jest.fn(), warn: jest.fn() },
        },
        FreeAccessProgramConfigurationManager,
      ],
    }).compile();
    manager = moduleRef.get(FreeAccessProgramConfigurationManager);
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

    it('propagates errors from the Strapi client', async () => {
      strapiClient.queryUncached.mockRejectedValue(new Error('strapi-down'));
      await expect(manager.getFreshProjection()).rejects.toThrow(
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
});
