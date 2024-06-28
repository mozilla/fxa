/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import { StatsD } from 'hot-shots';

import { StripePlanFactory } from '@fxa/payments/stripe';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { StatsDService } from '@fxa/shared/metrics/statsd';
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
import { ProductConfigurationManager } from './product-configuration.manager';
import {
  EligibilityContentByOfferingQueryFactory,
  EligibilityContentOfferingResultFactory,
} from './queries/eligibility-content-by-offering';
import {
  PageContentForOfferingQueryFactory,
  PageContentForOfferingResultUtil,
  PageContentOfferingResultFactory,
} from './queries/page-content-for-offering';
import { PurchaseWithDetailsOfferingContentUtil } from './queries/purchase-with-details-offering-content';
import { PurchaseWithDetailsOfferingContentByPlanIdsResultFactory } from './queries/purchase-with-details-offering-content/factories';
import { StrapiClient } from './strapi.client';

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

describe('productConfigurationManager', () => {
  let productConfigurationManager: ProductConfigurationManager;
  let strapiClient: StrapiClient;
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
        ProductConfigurationManager,
        StrapiClient,
      ],
    }).compile();

    strapiClient = module.get(StrapiClient);
    productConfigurationManager = module.get(ProductConfigurationManager);
  });

  it('should call statsd for incoming events', async () => {
    const queryData = EligibilityContentByPlanIdsQueryFactory({
      purchaseCollection: { items: [], total: 0 },
    });
    jest.spyOn(strapiClient.client, 'request').mockResolvedValue(queryData);

    await productConfigurationManager.getPurchaseDetailsForEligibility([
      'test',
    ]);

    expect(mockStatsd.timing).toHaveBeenCalledWith(
      'cms_request',
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

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getEligibilityContentByOffering(
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

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getEligibilityContentByOffering(
          apiIdentifier
        );
      expect(result).toBeInstanceOf(EligibilityContentByOfferingResultUtil);
      expect(result.getOffering()).toBeDefined();
    });
  });

  describe('getPageContentForOffering', () => {
    it('should return empty result', async () => {
      const queryData = PageContentForOfferingQueryFactory({
        offeringCollection: { items: [] },
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPageContentForOffering(
          'test',
          'en'
        );
      expect(result).toBeInstanceOf(PageContentForOfferingResultUtil);
      expect(result.offeringCollection.items).toHaveLength(0);
    });

    it('should return successfully with page content for offering', async () => {
      const apiIdentifier = 'test';
      const offeringResult = [
        PageContentOfferingResultFactory({
          apiIdentifier,
        }),
      ];
      const queryData = PageContentForOfferingQueryFactory({
        offeringCollection: {
          items: offeringResult,
        },
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPageContentForOffering(
          apiIdentifier,
          'en'
        );
      expect(result).toBeInstanceOf(PageContentForOfferingResultUtil);
      expect(result.getOffering().defaultPurchase.purchaseDetails).toEqual(
        result.purchaseDetailsTransform(
          offeringResult[0].defaultPurchase?.purchaseDetails
        )
      );
    });
  });

  describe('getPurchaseDetailsForEligibility', () => {
    it('should return empty result', async () => {
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchaseCollection: { items: [], total: 0 },
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForEligibility([
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

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForEligibility([
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

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForEligibility([
          'test',
        ]);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(strapiClient.query).toBeCalledTimes(2);
    });
  });

  describe('getPurchaseDetailsForCapabilityServiceByPlanId', () => {
    it('should return empty result', async () => {
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchaseCollection: { items: [], total: 0 },
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
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

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
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

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
          ['test']
        );
      expect(result).toBeInstanceOf(CapabilityServiceByPlanIdsResultUtil);
      expect(strapiClient.query).toBeCalledTimes(2);
    });
  });

  describe('getServicesWithCapabilities', () => {
    it('should return results', async () => {
      jest.spyOn(strapiClient, 'query').mockResolvedValue({
        serviceCollection: { items: [] },
      });

      const result =
        await productConfigurationManager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.serviceCollection.items).toHaveLength(0);
    });

    it('should return successfully with services and capabilities', async () => {
      const queryData = ServicesWithCapabilitiesQueryFactory();

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.serviceCollection.items).toHaveLength(1);
    });
  });

  describe('getPurchaseWithDetailsOfferingContentByPlanIds', () => {
    it('should return empty result', async () => {
      jest.spyOn(strapiClient, 'query').mockResolvedValue({
        purchaseCollection: { items: [] },
      });
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPurchaseWithDetailsOfferingContentByPlanIds(
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

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPurchaseWithDetailsOfferingContentByPlanIds(
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

  describe('getOfferingPlanIds', () => {
    it('returns planIds from offering', async () => {
      const apiIdentifier = 'test';
      const mockPlan = StripePlanFactory();
      const mockOffering = EligibilityContentOfferingResultFactory({
        defaultPurchase: {
          stripePlanChoices: [mockPlan.id],
        },
      });
      const mockOfferingResult = {} as EligibilityContentByOfferingResultUtil;

      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(mockOfferingResult);

      mockOfferingResult.getOffering = jest.fn().mockReturnValue(mockOffering);

      const result = await productConfigurationManager.getOfferingPlanIds(
        apiIdentifier
      );
      expect(result).toEqual([mockPlan.id]);
    });
  });
});
