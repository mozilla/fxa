/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { StatsD } from 'hot-shots';
import { DocumentNode } from 'graphql';

import { StatsDService } from '@fxa/shared/metrics/statsd';
import {
  relyingPartyQuery,
  RelyingPartyConfigurationManager
} from '../../src';
import { StrapiClient, StrapiClientEventResponse } from './strapi.client';
import { RelyingPartyQueryFactory } from './queries/relying-party/factories';

// Mock external dependencies
jest.mock('@type-cacheable/core', () => ({
  Cacheable: () => {
    return (target: any, propertyKey: any, descriptor: any) => descriptor;
  },
  setOptions: jest.fn(),
}));

jest.mock('@fxa/shared/db/type-cacheable', () => ({
  NetworkFirstStrategy: function () {},
  AsyncLocalStorageAdapter: function () {},
  CacheFirstStrategy: function () {},
  MemoryAdapter: function () {},
}));

// Mock Apollo's getOperationName
jest.mock('@apollo/client/utilities', () => ({
  getOperationName: jest.fn().mockReturnValue('MockOperation'),
}));

describe('RelyingPartyConfigurationManager', () => {
  let relyingPartyConfigurationManager: RelyingPartyConfigurationManager;
  let mockStrapiClient: jest.Mocked<StrapiClient>;
  let mockStatsd: jest.Mocked<StatsD>;

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
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        RelyingPartyConfigurationManager,
        { provide: StatsDService, useValue: mockStatsd },
        { provide: StrapiClient, useValue: mockStrapiClient },
      ],
    })
      .compile();

    relyingPartyConfigurationManager = module.get(RelyingPartyConfigurationManager);
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
      const { clientId, entrypoint } = mockData.relyingParties[0];

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
});