/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';

import { ContentfulClient } from './contentful.client';
import { ContentfulManager } from './contentful.manager';
import {
  CapabilityPurchaseResult,
  CapabilityPurchaseResultFactory,
  CapabilityServiceByPlanIdsQueryFactory,
  CapabilityServiceByPlanIdsResultUtil,
  ContentfulClientConfig,
  EligibilityContentByOfferingResultUtil,
  EligibilityContentByPlanIdsQueryFactory,
  EligibilityContentByPlanIdsResultUtil,
  EligibilityPurchaseResult,
  EligibilityPurchaseResultFactory,
  ServicesWithCapabilitiesQueryFactory,
  ServicesWithCapabilitiesResultUtil,
} from '../../src';
import {
  EligibilityContentByOfferingQueryFactory,
  EligibilityContentOfferingResultFactory,
} from './queries/eligibility-content-by-offering';
import { PurchaseWithDetailsOfferingContentUtil } from './queries/purchase-with-details-offering-content';
import { PurchaseWithDetailsOfferingContentByPlanIdsResultFactory } from './queries/purchase-with-details-offering-content/factories';
import { StatsD } from 'hot-shots';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { StatsDService } from '@fxa/shared/metrics/statsd';

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
  let contentfulManager: ContentfulManager;
  let contentfulClient: ContentfulClient;
  let mockStatsd: StatsD;

  beforeEach(async () => {
    mockStatsd = {
      timing: jest.fn().mockReturnValue({}),
    } as unknown as StatsD;

    const module = await Test.createTestingModule({
      providers: [
        { provide: StatsDService, useValue: mockStatsd },
        MockFirestoreProvider,
        ContentfulClientConfig,
        ContentfulClient,
        ContentfulManager,
      ],
    }).compile();

    contentfulClient = module.get(ContentfulClient);
    contentfulManager = module.get(ContentfulManager);
  });

  it('should call statsd for incoming events', async () => {
    const queryData = EligibilityContentByPlanIdsQueryFactory({
      purchaseCollection: { items: [], total: 0 },
    });
    jest.spyOn(contentfulClient.client, 'request').mockResolvedValue(queryData);

    await contentfulManager.getPurchaseDetailsForEligibility(['test']);

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

  describe('getEligibilityContentByOffering', () => {
    it('should return empty result', async () => {
      const queryData = EligibilityContentByOfferingQueryFactory({
        offeringCollection: { items: [] },
      });

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result = await contentfulManager.getEligibilityContentByOffering(
        'test'
      );
      expect(result).toBeInstanceOf(EligibilityContentByOfferingResultUtil);
    });

    it('should return successfully with results', async () => {
      const apiIdentifier = 'test';
      const offeringResult = [
        EligibilityContentOfferingResultFactory({ apiIdentifier }),
      ];
      const queryData = EligibilityContentByOfferingQueryFactory({
        offeringCollection: {
          items: offeringResult,
        },
      });

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result = await contentfulManager.getEligibilityContentByOffering(
        apiIdentifier
      );
      expect(result).toBeInstanceOf(EligibilityContentByOfferingResultUtil);
      expect(result.getOffering()).toBeDefined();
    });
  });

  describe('getPurchaseDetailsForEligibility', () => {
    it('should return empty result', async () => {
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchaseCollection: { items: [], total: 0 },
      });

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result = await contentfulManager.getPurchaseDetailsForEligibility([
        'test',
      ]);
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

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result = await contentfulManager.getPurchaseDetailsForEligibility([
        'test',
      ]);
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

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result = await contentfulManager.getPurchaseDetailsForEligibility([
        'test',
      ]);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(contentfulClient.query).toBeCalledTimes(2);
    });
  });

  describe('getPurchaseDetailsForCapabilityServiceByPlanId', () => {
    it('should return empty result', async () => {
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchaseCollection: { items: [], total: 0 },
      });

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result =
        await contentfulManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
          ['test']
        );
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

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result =
        await contentfulManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
          ['test']
        );
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

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result =
        await contentfulManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
          ['test']
        );
      expect(result).toBeInstanceOf(CapabilityServiceByPlanIdsResultUtil);
      expect(contentfulClient.query).toBeCalledTimes(2);
    });
  });

  describe('getServicesWithCapabilities', () => {
    it('should return results', async () => {
      jest.spyOn(contentfulClient, 'query').mockResolvedValue({
        serviceCollection: { items: [] },
      });

      const result = await contentfulManager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.serviceCollection.items).toHaveLength(0);
    });

    it('should return successfully with services and capabilities', async () => {
      const queryData = ServicesWithCapabilitiesQueryFactory();

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);

      const result = await contentfulManager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.serviceCollection.items).toHaveLength(1);
    });
  });

  describe('getPurchaseWithDetailsOfferingContentByPlanIds', () => {
    it('should return empty result', async () => {
      jest.spyOn(contentfulClient, 'query').mockResolvedValue({
        purchaseCollection: { items: [] },
      });
      jest.spyOn(contentfulClient, 'getLocale').mockResolvedValue('en');

      const result =
        await contentfulManager.getPurchaseWithDetailsOfferingContentByPlanIds(
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

      jest.spyOn(contentfulClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(contentfulClient, 'getLocale').mockResolvedValue('en');

      const result =
        await contentfulManager.getPurchaseWithDetailsOfferingContentByPlanIds(
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
