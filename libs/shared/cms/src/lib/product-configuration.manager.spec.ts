/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import { StatsD } from 'hot-shots';

import {
  PriceManager,
  StripeClient,
  StripeConfig,
  StripePlanFactory,
  StripePriceFactory,
  StripeResponseFactory,
  SubplatInterval,
} from '@fxa/payments/stripe';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider, StatsDService } from '@fxa/shared/metrics/statsd';
import {
  CapabilityPurchaseResult,
  CapabilityPurchaseResultFactory,
  CapabilityServiceByPlanIdsQueryFactory,
  CapabilityServiceByPlanIdsResultUtil,
  EligibilityContentByOfferingResultUtil,
  EligibilityContentByPlanIdsQueryFactory,
  EligibilityContentByPlanIdsResultUtil,
  EligibilityPurchaseResult,
  EligibilityPurchaseResultFactory,
  ProductConfigError,
  ServicesWithCapabilitiesQueryFactory,
  ServicesWithCapabilitiesResultUtil,
  StrapiEntity,
  StrapiEntityFactory,
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
  PageContentOfferingTransformedFactory,
} from './queries/page-content-for-offering';
import { PurchaseWithDetailsOfferingContentUtil } from './queries/purchase-with-details-offering-content';
import { PurchaseWithDetailsOfferingContentByPlanIdsResultFactory } from './queries/purchase-with-details-offering-content/factories';
import { StrapiClient } from './strapi.client';
import { MockStrapiClientConfigProvider } from './strapi.client.config';

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
  let priceManager: PriceManager;
  let productConfigurationManager: ProductConfigurationManager;
  let strapiClient: StrapiClient;
  let mockStatsd: StatsD;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: StatsDService, useValue: mockStatsd },
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        PriceManager,
        ProductConfigurationManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
      ],
    }).compile();

    mockStatsd = module.get(StatsDService);
    strapiClient = module.get(StrapiClient);
    priceManager = module.get(PriceManager);
    productConfigurationManager = module.get(ProductConfigurationManager);
  });

  it('should call statsd for incoming events', async () => {
    const queryData = EligibilityContentByPlanIdsQueryFactory({
      purchases: {
        data: [],
        meta: {
          pagination: {
            total: 0,
          },
        },
      },
    });
    jest.spyOn(strapiClient.client, 'request').mockResolvedValue(queryData);
    jest.spyOn(mockStatsd, 'timing');

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

  describe('fetchCMSData', () => {
    it('fetches CMS data successfully', async () => {
      const mockOffering = PageContentOfferingTransformedFactory();

      jest
        .spyOn(productConfigurationManager, 'getPageContentForOffering')
        .mockResolvedValue({
          getOffering: jest.fn().mockResolvedValue(mockOffering),
        } as unknown as PageContentForOfferingResultUtil);

      const result = await productConfigurationManager.fetchCMSData(
        mockOffering.apiIdentifier,
        'en'
      );

      expect(result).toEqual(mockOffering);
    });
  });

  describe('getEligibilityContentByOffering', () => {
    it('should return empty result', async () => {
      const queryData = EligibilityContentByOfferingQueryFactory({
        offerings: { data: [] },
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
        StrapiEntityFactory(
          EligibilityContentOfferingResultFactory({ apiIdentifier })
        ),
      ];
      const queryData = EligibilityContentByOfferingQueryFactory({
        offerings: {
          data: offeringResult,
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
        offerings: { data: [], meta: { pagination: { total: 0 } } },
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPageContentForOffering(
          'test',
          'en'
        );
      expect(result).toBeInstanceOf(PageContentForOfferingResultUtil);
      expect(result.offerings.data).toHaveLength(0);
    });

    it('should return successfully with page content for offering', async () => {
      const apiIdentifier = 'test';
      const offeringResult = [
        StrapiEntityFactory(
          PageContentOfferingResultFactory({
            apiIdentifier,
          })
        ),
      ];
      const queryData = PageContentForOfferingQueryFactory({
        offerings: {
          data: offeringResult,
          meta: { pagination: { total: offeringResult.length } },
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
      expect(
        result.getOffering().defaultPurchase.data.attributes.purchaseDetails
          .data.attributes
      ).toEqual({
        ...result.purchaseDetailsTransform(
          offeringResult[0].attributes.defaultPurchase?.data.attributes
            .purchaseDetails.data.attributes
        ),
        localizations: {
          data: offeringResult[0].attributes.defaultPurchase?.data.attributes.purchaseDetails.data.attributes.localizations.data.map(
            (localization) => ({
              attributes: result.purchaseDetailsTransform(
                localization.attributes
              ),
            })
          ),
        },
      });
    });
  });

  describe('getPurchaseDetailsForEligibility', () => {
    it('should return empty result', async () => {
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchases: {
          data: [],
          meta: {
            pagination: {
              total: 0,
            },
          },
        },
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForEligibility([
          'test',
        ]);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(result.offeringForPlanId('test')).toBeUndefined;
      expect(result.purchases.data).toHaveLength(0);
    });

    it('should return successfully with subgroups and offering', async () => {
      const planId = 'test';
      const purchaseResult = [
        StrapiEntityFactory(
          EligibilityPurchaseResultFactory({
            stripePlanChoices: [{ stripePlanChoice: planId }],
          })
        ),
      ];
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchases: {
          data: purchaseResult,
          meta: {
            pagination: {
              total: purchaseResult.length,
            },
          },
        },
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForEligibility([
          'test',
        ]);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(result.offeringForPlanId(planId)?.subGroups.data).toHaveLength(1);
      expect(result.offeringForPlanId(planId)).toBeDefined();
    });

    it('should return successfully with paging', async () => {
      const pageSize = 20;
      const purchaseResult: StrapiEntity<EligibilityPurchaseResult>[] = [];
      for (let i = 0; i < pageSize + 1; i += 1) {
        purchaseResult.push(
          StrapiEntityFactory(EligibilityPurchaseResultFactory())
        );
      }
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchases: {
          data: purchaseResult,
          meta: {
            pagination: {
              total: purchaseResult.length,
            },
          },
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
        purchases: {
          data: [],
          meta: {
            pagination: {
              total: 0,
            },
          },
        },
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
        StrapiEntityFactory(
          CapabilityPurchaseResultFactory({
            stripePlanChoices: [{ stripePlanChoice: planId }],
          })
        ),
      ];
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchases: {
          data: purchaseResult,
          meta: {
            pagination: {
              total: purchaseResult.length,
            },
          },
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
      const purchaseResult: StrapiEntity<CapabilityPurchaseResult>[] = [];
      for (let i = 0; i < pageSize + 1; i += 1) {
        purchaseResult.push(
          StrapiEntityFactory(CapabilityPurchaseResultFactory())
        );
      }
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchases: {
          data: purchaseResult,
          meta: {
            pagination: {
              total: purchaseResult.length,
            },
          },
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
      const queryData = ServicesWithCapabilitiesQueryFactory({
        services: {
          data: [],
        },
      });
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.services.data).toHaveLength(0);
    });

    it('should return successfully with services and capabilities', async () => {
      const queryData = ServicesWithCapabilitiesQueryFactory();

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.services.data).toHaveLength(1);
    });
  });

  describe('getPurchaseWithDetailsOfferingContentByPlanIds', () => {
    it('should return empty result', async () => {
      const queryData =
        PurchaseWithDetailsOfferingContentByPlanIdsResultFactory({
          purchases: { data: [] },
        });
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPurchaseWithDetailsOfferingContentByPlanIds(
          ['test'],
          'en'
        );
      expect(result).toBeInstanceOf(PurchaseWithDetailsOfferingContentUtil);
      expect(result.purchases.data).toHaveLength(0);
    });

    it('should return successfully with purchase details and offering', async () => {
      const queryData =
        PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
      const queryDataItem = queryData.purchases.data[0];

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPurchaseWithDetailsOfferingContentByPlanIds(
          ['test'],
          'en'
        );
      const { stripePlanChoice } =
        result.purchases.data[0].attributes.stripePlanChoices?.[0];
      expect(result).toBeInstanceOf(PurchaseWithDetailsOfferingContentUtil);
      expect(
        result.transformedPurchaseWithCommonContentForPlanId(
          stripePlanChoice ?? ''
        )?.offering
      ).toEqual(queryDataItem.attributes.offering);
      expect(
        result.transformedPurchaseWithCommonContentForPlanId(
          stripePlanChoice ?? ''
        )?.purchaseDetails.data.attributes
      ).toEqual({
        ...result.purchaseDetailsTransform(
          queryDataItem.attributes.purchaseDetails.data.attributes
        ),
        localizations: {
          data: queryDataItem.attributes.purchaseDetails.data.attributes.localizations.data.map(
            (localization) => ({
              attributes: result.purchaseDetailsTransform(
                localization.attributes
              ),
            })
          ),
        },
      });
    });
  });

  describe('getOfferingPlanIds', () => {
    it('returns planIds from offering', async () => {
      const apiIdentifier = 'test';
      const mockPlan = StripePlanFactory();
      const mockOffering = EligibilityContentOfferingResultFactory({
        defaultPurchase: {
          data: {
            attributes: {
              stripePlanChoices: [{ stripePlanChoice: mockPlan.id }],
            },
          },
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

  describe('retrieveStripePriceId', () => {
    it('returns plan based on offeringId and interval', async () => {
      const mockPrice = StripeResponseFactory(StripePriceFactory());
      const mockInterval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory({
        defaultPurchase: {
          data: {
            attributes: {
              stripePlanChoices: [{ stripePlanChoice: mockPrice.id }],
            },
          },
        },
      });

      jest
        .spyOn(productConfigurationManager, 'getOfferingPlanIds')
        .mockResolvedValue([mockPrice.id]);

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice);

      const result = await productConfigurationManager.retrieveStripePriceId(
        mockOffering.apiIdentifier,
        mockInterval
      );
      expect(result).toEqual(mockPrice.id);
    });

    it('throws error if no plans are found', async () => {
      const mockInterval = SubplatInterval.Yearly;
      const mockOffering = EligibilityContentOfferingResultFactory();
      const mockPrice = StripeResponseFactory(StripePriceFactory());

      jest
        .spyOn(productConfigurationManager, 'getOfferingPlanIds')
        .mockResolvedValue([mockPrice.id]);

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(undefined);

      await expect(
        productConfigurationManager.retrieveStripePriceId(
          mockOffering.apiIdentifier,
          mockInterval
        )
      ).rejects.toThrow(ProductConfigError);
    });
  });
});
