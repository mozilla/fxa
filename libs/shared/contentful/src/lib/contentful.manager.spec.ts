/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import { ContentfulClient } from './contentful.client';
import { ContentfulManager } from './contentful.manager';
import {
  CapabilityPurchaseResult,
  CapabilityPurchaseResultFactory,
  CapabilityServiceByPlanIdsQueryFactory,
  CapabilityServiceByPlanIdsResultUtil,
  EligibilityContentByPlanIdsQueryFactory,
  EligibilityContentByPlanIdsResultUtil,
  EligibilityPurchaseResult,
  EligibilityPurchaseResultFactory,
  ServicesWithCapabilitiesQueryFactory,
  ServicesWithCapabilitiesResultUtil,
} from '../../src';
import { PurchaseWithDetailsOfferingContentUtil } from './queries/purchase-with-details-offering-content';
import { PurchaseWithDetailsOfferingContentByPlanIdsResultFactory } from './queries/purchase-with-details-offering-content/factories';
import { StatsD } from 'hot-shots';

jest.mock('@type-cacheable/core', () => ({
  Cacheable: () => {
    return (target: any, propertyKey: any, descriptor: any) => {
      return descriptor;
    };
  },
}));

jest.mock('@fxa/shared/db/type-cacheable', () => ({
  NetworkFirstStrategy: function () {},
}));

describe('ContentfulManager', () => {
  let manager: ContentfulManager;
  let mockClient: ContentfulClient;
  let mockStatsd: StatsD;

  beforeEach(async () => {
    mockClient = new ContentfulClient({} as any, {} as any);
    mockStatsd = {
      timing: jest.fn().mockReturnValue({}),
    } as unknown as StatsD;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: StatsD, useValue: mockStatsd },
        { provide: ContentfulClient, useValue: mockClient },
        ContentfulManager,
      ],
    }).compile();

    manager = module.get<ContentfulManager>(ContentfulManager);
  });

  it('should be defined', () => {
    expect(manager).toBeDefined();
  });

  it('should call statsd for incoming events', async () => {
    const queryData = EligibilityContentByPlanIdsQueryFactory({
      purchaseCollection: { items: [], total: 0 },
    });
    mockClient.client.request = jest.fn().mockResolvedValue(queryData);
    await manager.getPurchaseDetailsForEligibility(['test']);
    expect(mockStatsd.timing).toHaveBeenCalledWith(
      'contentful_request',
      expect.any(Number),
      undefined,
      {
        method: 'query',
        error: 'false',
        cache: 'false',
        operationName: 'EligibilityContentByPlanIds',
      }
    );
  });

  describe('getPurchaseDetailsForEligibility', () => {
    it('should return empty result', async () => {
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchaseCollection: { items: [], total: 0 },
      });
      mockClient.query = jest.fn().mockReturnValue(queryData);
      const result = await manager.getPurchaseDetailsForEligibility(['test']);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(result.offeringForPlanId('test')).toBeUndefined;
      expect(result.purchaseCollection.items).toHaveLength(0);
    });

    it('should return successfully with subgroups and offering', async () => {
      const planId = 'test';
      const purchaseResult = [
        EligibilityPurchaseResultFactory({ stripePlanChoices: [planId] }),
      ];
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchaseCollection: {
          items: purchaseResult,
          total: purchaseResult.length,
        },
      });
      mockClient.query = jest.fn().mockResolvedValueOnce(queryData);
      const result = await manager.getPurchaseDetailsForEligibility(['test']);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(
        result.offeringForPlanId(planId)?.linkedFrom.subGroupCollection.items
      ).toHaveLength(1);
      expect(result.offeringForPlanId(planId)).toBeDefined();
    });

    it('should return successfully with paging', async () => {
      const pageSize = 20;
      const purchaseResult: EligibilityPurchaseResult[] = [];
      for (let i = 0; i < pageSize + 1; i += 1) {
        purchaseResult.push(EligibilityPurchaseResultFactory());
      }
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchaseCollection: {
          items: purchaseResult,
          total: purchaseResult.length,
        },
      });
      mockClient.query = jest.fn().mockResolvedValue(queryData);
      const result = await manager.getPurchaseDetailsForEligibility(['test']);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(mockClient.query).toBeCalledTimes(2);
    });
  });

  describe('getPurchaseDetailsForCapabilityServiceByPlanId', () => {
    it('should return empty result', async () => {
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchaseCollection: { items: [], total: 0 },
      });
      mockClient.query = jest.fn().mockResolvedValue(queryData);
      const result =
        await manager.getPurchaseDetailsForCapabilityServiceByPlanIds(['test']);
      expect(result).toBeInstanceOf(CapabilityServiceByPlanIdsResultUtil);
      expect(result.capabilityOfferingForPlanId('test')).toBeUndefined();
    });

    it('should return successfully with results', async () => {
      const planId = 'test';
      const purchaseResult = [
        CapabilityPurchaseResultFactory({ stripePlanChoices: [planId] }),
      ];
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchaseCollection: {
          items: purchaseResult,
          total: purchaseResult.length,
        },
      });
      mockClient.query = jest.fn().mockResolvedValue(queryData);
      const result =
        await manager.getPurchaseDetailsForCapabilityServiceByPlanIds(['test']);
      expect(result).toBeInstanceOf(CapabilityServiceByPlanIdsResultUtil);
      expect(result.capabilityOfferingForPlanId(planId)).toBeDefined();
    });

    it('should return successfully with paging', async () => {
      const pageSize = 20;
      const purchaseResult: CapabilityPurchaseResult[] = [];
      for (let i = 0; i < pageSize + 1; i += 1) {
        purchaseResult.push(CapabilityPurchaseResultFactory());
      }
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchaseCollection: {
          items: purchaseResult,
          total: purchaseResult.length,
        },
      });
      mockClient.query = jest.fn().mockResolvedValue(queryData);
      const result =
        await manager.getPurchaseDetailsForCapabilityServiceByPlanIds(['test']);
      expect(result).toBeInstanceOf(CapabilityServiceByPlanIdsResultUtil);
      expect(mockClient.query).toBeCalledTimes(2);
    });
  });

  describe('getServicesWithCapabilities', () => {
    it('should return results', async () => {
      mockClient.query = jest.fn().mockReturnValue({
        serviceCollection: { items: [] },
      });
      const result = await manager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.serviceCollection.items).toHaveLength(0);
    });

    it('should return successfully with services and capabilities', async () => {
      const queryData = ServicesWithCapabilitiesQueryFactory();
      mockClient.query = jest.fn().mockResolvedValueOnce(queryData);
      const result = await manager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.serviceCollection.items).toHaveLength(1);
    });
  });

  describe('getPurchaseWithDetailsOfferingContentByPlanIds', () => {
    it('should return empty result', async () => {
      mockClient.query = jest.fn().mockReturnValue({
        purchaseCollection: { items: [] },
      });
      mockClient.getLocale = jest.fn().mockResolvedValue('en');
      const result =
        await manager.getPurchaseWithDetailsOfferingContentByPlanIds(
          ['test'],
          'en'
        );
      expect(result).toBeInstanceOf(PurchaseWithDetailsOfferingContentUtil);
      expect(result.purchaseCollection.items).toHaveLength(0);
    });

    it('should return successfully with purchase details and offering', async () => {
      const queryData =
        PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
      const queryDataItem = queryData.purchaseCollection.items[0];
      mockClient.query = jest.fn().mockResolvedValueOnce(queryData);
      mockClient.getLocale = jest.fn().mockResolvedValue('en');
      const result =
        await manager.getPurchaseWithDetailsOfferingContentByPlanIds(
          ['test'],
          'en'
        );
      const planId = result.purchaseCollection.items[0].stripePlanChoices?.[0];
      expect(result).toBeInstanceOf(PurchaseWithDetailsOfferingContentUtil);
      expect(
        result.transformedPurchaseWithCommonContentForPlanId(planId ?? '')
          ?.offering
      ).toEqual(queryDataItem.offering);
      expect(
        result.transformedPurchaseWithCommonContentForPlanId(planId ?? '')
          ?.purchaseDetails
      ).toEqual(result.purchaseDetailsTransform(queryDataItem.purchaseDetails));
    });
  });
});
