/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';
import { StatsD } from 'hot-shots';

import {
  getSubplatInterval,
  PriceManager,
  SubplatInterval,
} from '@fxa/payments/customer';
import {
  StripeClient,
  StripeConfig,
  StripePlanFactory,
  StripePriceFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider, StatsDService } from '@fxa/shared/metrics/statsd';
import {
  cancelInterstitialOfferQuery,
  CancelInterstitialOfferResultFactory,
  CancelInterstitialOfferUtil,
  CapabilityPurchaseResultFactory,
  CapabilityServiceByPlanIdsQueryFactory,
  CapabilityServiceByPlanIdsResultUtil,
  churnInterventionByProductIdQuery,
  ChurnInterventionByProductIdQueryFactory,
  ChurnInterventionByProductIdResultUtil,
  EligibilityContentByOfferingResultUtil,
  eligibilityContentByPlanIdsQuery,
  EligibilityContentByPlanIdsQueryFactory,
  EligibilityContentByPlanIdsResultUtil,
  EligibilityPurchaseResultFactory,
  IapOfferingByStoreIDResultFactory,
  IapOfferingsByStoreIDsResultUtil,
  ProductConfigError,
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
  PageContentOfferingTransformedFactory,
} from './queries/page-content-for-offering';
import { PurchaseWithDetailsOfferingContentUtil } from './queries/purchase-with-details-offering-content';
import { PurchaseWithDetailsOfferingContentByPlanIdsResultFactory } from './queries/purchase-with-details-offering-content/factories';
import { StrapiClient } from './strapi.client';
import { MockStrapiClientConfigProvider } from './strapi.client.config';
import {
  PageContentByPriceIdsPurchaseResultFactory,
  PageContentByPriceIdsQueryFactory,
  PageContentByPriceIdsResultUtil,
} from './queries/page-content-by-price-ids';
import { faker } from '@faker-js/faker/.';
import {
    freeTrialQuery,
    FreeTrialResultFactory,
    FreeTrialUtil,
} from './queries/free-trial';

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

describe('productConfigurationManager', () => {
  let priceManager: PriceManager;
  let productConfigurationManager: ProductConfigurationManager;
  let strapiClient: StrapiClient;
  let mockStatsd: StatsD;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
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
    stripeClient = module.get(StripeClient);
  });

  describe('onStrapiClientResponse', () => {
    it('should call statsd for incoming events', async () => {
      jest.spyOn(mockStatsd, 'timing');

      productConfigurationManager.onStrapiClientResponse({
        method: 'query',
        requestStartTime: 0,
        requestEndTime: 1,
        elapsed: 1,
        cache: false,
        cacheType: 'method',
        query: eligibilityContentByPlanIdsQuery as any,
        error: undefined,
      });

      expect(mockStatsd.timing).toHaveBeenCalledWith(
        'cms_request',
        expect.any(Number),
        undefined,
        {
          method: 'query',
          error: 'false',
          cache: 'false',
          cacheType: 'method',
          operationName: 'EligibilityContentByPlanIds',
        }
      );
    });
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
        offerings: [],
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
        offerings: offeringResult,
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
        offerings: [],
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPageContentForOffering(
          'test',
          'en'
        );
      expect(result).toBeInstanceOf(PageContentForOfferingResultUtil);
      expect(result.offerings).toHaveLength(0);
    });

    it('should return successfully with page content for offering', async () => {
      const apiIdentifier = 'test';
      const offeringResult = PageContentOfferingResultFactory({
        apiIdentifier,
      });
      const queryData = PageContentForOfferingQueryFactory({
        offerings: [offeringResult],
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPageContentForOffering(
          apiIdentifier,
          'en'
        );
      expect(result).toBeInstanceOf(PageContentForOfferingResultUtil);
      expect(result.getOffering().defaultPurchase.purchaseDetails).toEqual({
        ...result.purchaseDetailsTransform(
          offeringResult.defaultPurchase?.purchaseDetails
        ),
        localizations:
          offeringResult.defaultPurchase.purchaseDetails.localizations.map(
            (localization) => result.purchaseDetailsTransform(localization)
          ),
      });
    });
  });

  describe('getPageContentByPriceIds', () => {
    it('should return empty result', async () => {
      const queryData = PageContentByPriceIdsQueryFactory({
        purchases: [],
      });

      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result = await productConfigurationManager.getPageContentByPriceIds(
        ['test']
      );
      expect(result).toBeInstanceOf(PageContentByPriceIdsResultUtil);
    });

    it('should return successfully', async () => {
      const priceId = 'test';
      const purchaseResult = PageContentByPriceIdsPurchaseResultFactory({
        purchaseDetails: {
          productName: 'Sonny and Jerry Two-Fur-One Special',
          webIcon: '',
          localizations: [],
        },
        stripePlanChoices: [{ stripePlanChoice: priceId }],
      });
      const queryData = PageContentByPriceIdsQueryFactory({
        purchases: [purchaseResult],
      });

      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result = await productConfigurationManager.getPageContentByPriceIds(
        [priceId]
      );

      expect(result).toBeInstanceOf(PageContentByPriceIdsResultUtil);
      expect(result.productNameForPriceId('test')).toBeDefined;
      expect(result.purchases).toHaveLength(1);
    });
  });

  describe('getIapPageContentByStoreIds', () => {
    it('should return product names', async () => {
      const mockStoreIds = ['store1', 'store2'];
      const mockIapResult = IapOfferingByStoreIDResultFactory();
      const mockIapOfferingResult = new IapOfferingsByStoreIDsResultUtil(
        mockIapResult
      );

      mockIapOfferingResult.getIapPageContentByStoreIds = jest
        .fn()
        .mockReturnValue(mockIapResult);
      jest
        .spyOn(productConfigurationManager, 'getIapOfferings')
        .mockResolvedValue(mockIapOfferingResult);

      const result =
        await productConfigurationManager.getIapPageContentByStoreIds(
          mockStoreIds
        );

      expect(productConfigurationManager.getIapOfferings).toHaveBeenCalledWith(
        mockStoreIds
      );
      expect(
        mockIapOfferingResult.getIapPageContentByStoreIds
      ).toHaveBeenCalledWith(mockStoreIds);
      expect(result).toEqual(mockIapResult);
    });
  });

  describe('getPurchaseDetailsForEligibility', () => {
    it('should return empty result', async () => {
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchases: [],
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForEligibility([
          'test',
        ]);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(result.offeringForPlanId('test')).toBeUndefined;
      expect(result.purchases).toHaveLength(0);
    });

    it('should return successfully with subgroups and offering', async () => {
      const planId = 'test';
      const purchaseResult = [
        EligibilityPurchaseResultFactory({
          stripePlanChoices: [{ stripePlanChoice: planId }],
        }),
      ];
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchases: purchaseResult,
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForEligibility([
          'test',
        ]);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(result.offeringForPlanId(planId)?.subGroups).toHaveLength(1);
      expect(result.offeringForPlanId(planId)).toBeDefined();
    });

    it('should return successfully', async () => {
      const purchaseResult = [
        EligibilityPurchaseResultFactory(),
        EligibilityPurchaseResultFactory(),
      ];
      const queryData = EligibilityContentByPlanIdsQueryFactory({
        purchases: purchaseResult,
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForEligibility([
          'test',
        ]);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(strapiClient.query).toBeCalledTimes(1);
    });
  });

  describe('getPurchaseDetailsForCapabilityServiceByPlanId', () => {
    it('should return empty result', async () => {
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchases: [],
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
      const purchaseResult = CapabilityPurchaseResultFactory({
        stripePlanChoices: [{ stripePlanChoice: planId }],
      });
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchases: [purchaseResult],
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
          ['test']
        );
      expect(result).toBeInstanceOf(CapabilityServiceByPlanIdsResultUtil);
      expect(result.capabilityOfferingForPlanId(planId)).toBeDefined();
    });

    it('should return successfully', async () => {
      const purchaseResult = [
        CapabilityPurchaseResultFactory(),
        CapabilityPurchaseResultFactory(),
      ];
      const queryData = CapabilityServiceByPlanIdsQueryFactory({
        purchases: purchaseResult,
      });

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getPurchaseDetailsForCapabilityServiceByPlanIds(
          ['test']
        );
      expect(result).toBeInstanceOf(CapabilityServiceByPlanIdsResultUtil);
      expect(strapiClient.query).toBeCalledTimes(1);
    });
  });

  describe('getServicesWithCapabilities', () => {
    it('should return results', async () => {
      const queryData = ServicesWithCapabilitiesQueryFactory({
        services: [],
      });
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.services).toHaveLength(0);
    });

    it('should return successfully with services and capabilities', async () => {
      const queryData = ServicesWithCapabilitiesQueryFactory();

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const result =
        await productConfigurationManager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.services).toHaveLength(1);
    });
  });

  describe('getPurchaseWithDetailsOfferingContentByPlanIds', () => {
    it('should return empty result', async () => {
      const queryData =
        PurchaseWithDetailsOfferingContentByPlanIdsResultFactory({
          purchases: [],
        });
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPurchaseWithDetailsOfferingContentByPlanIds(
          ['test'],
          'en'
        );
      expect(result).toBeInstanceOf(PurchaseWithDetailsOfferingContentUtil);
      expect(result.purchases).toHaveLength(0);
    });

    it('should return successfully with purchase details and offering', async () => {
      const queryData =
        PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
      const queryDataItem = queryData.purchases[0];

      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const result =
        await productConfigurationManager.getPurchaseWithDetailsOfferingContentByPlanIds(
          ['test'],
          'en'
        );
      const { stripePlanChoice } = result.purchases[0].stripePlanChoices?.[0];
      expect(result).toBeInstanceOf(PurchaseWithDetailsOfferingContentUtil);
      expect(
        result.transformedPurchaseWithCommonContentForPlanId(
          stripePlanChoice ?? ''
        )?.offering
      ).toEqual(queryDataItem.offering);
      expect(
        result.transformedPurchaseWithCommonContentForPlanId(
          stripePlanChoice ?? ''
        )?.purchaseDetails
      ).toEqual({
        ...result.purchaseDetailsTransform(queryDataItem.purchaseDetails),
        localizations: queryDataItem.purchaseDetails.localizations.map(
          (localization) => result.purchaseDetailsTransform(localization)
        ),
      });
    });
  });

  describe('getOfferingPlanIds', () => {
    it('returns planIds from offering', async () => {
      const apiIdentifier = 'test';
      const mockPlan = StripePlanFactory();
      const mockOffering = EligibilityContentOfferingResultFactory({
        defaultPurchase: {
          stripePlanChoices: [{ stripePlanChoice: mockPlan.id }],
        },
      });
      const mockOfferingResult = {} as EligibilityContentByOfferingResultUtil;

      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(mockOfferingResult);

      mockOfferingResult.getOffering = jest.fn().mockReturnValue(mockOffering);

      const result =
        await productConfigurationManager.getOfferingPlanIds(apiIdentifier);
      expect(result).toEqual([mockPlan.id]);
    });
  });

  describe('getSupportedLocale', () => {
    it('should call strapiClient and return result', async () => {
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');
      const result = await productConfigurationManager.getSupportedLocale('en');
      expect(result).toEqual('en');
    });

    it('should reject with error', async () => {
      jest
        .spyOn(strapiClient, 'getLocale')
        .mockRejectedValue(new Error('error'));
      await expect(
        productConfigurationManager.getSupportedLocale('en')
      ).rejects.toThrow();
    });
  });

  describe('retrieveStripePrice', () => {
    it('returns plan based on offeringId and interval', async () => {
      const mockPrice = StripeResponseFactory(StripePriceFactory());
      const mockInterval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory({
        defaultPurchase: {
          stripePlanChoices: [{ stripePlanChoice: mockPrice.id }],
        },
      });

      jest
        .spyOn(productConfigurationManager, 'getOfferingPlanIds')
        .mockResolvedValue([mockPrice.id]);

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice);

      const result = await productConfigurationManager.retrieveStripePrice(
        mockOffering.apiIdentifier,
        mockInterval
      );
      expect(result).toEqual(mockPrice);
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
        productConfigurationManager.retrieveStripePrice(
          mockOffering.apiIdentifier,
          mockInterval
        )
      ).rejects.toThrow(ProductConfigError);
    });
  });

  describe('getChurnIntervention', () => {
    it('returns Churn Intervention based on product id', async () => {
      const queryData = ChurnInterventionByProductIdQueryFactory();
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const subplatInterval = faker.helpers.enumValue(SubplatInterval);
      const stripeProductId = faker.string.sample();

      const result = await productConfigurationManager.getChurnIntervention(
        subplatInterval,
        'cancel',
        stripeProductId,
        null,
        'en'
      );

      expect(strapiClient.query).toHaveBeenCalledWith(
        churnInterventionByProductIdQuery,
        {
          stripeProductId,
          offeringApiIdentifier: null,
          interval: subplatInterval,
          churnType: 'cancel',
          locale: 'en',
        }
      );

      expect(result).toBeInstanceOf(ChurnInterventionByProductIdResultUtil);
      expect(result.churnInterventionByProductId.offerings).toHaveLength(1);
    });

    it('returns Churn Intervention based on api identifier', async () => {
      const queryData = ChurnInterventionByProductIdQueryFactory();
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const subplatInterval = faker.helpers.enumValue(SubplatInterval);
      const offeringApiIdentifier = faker.string.sample();

      const result = await productConfigurationManager.getChurnIntervention(
        subplatInterval,
        'cancel',
        null,
        offeringApiIdentifier,
        'en'
      );

      expect(strapiClient.query).toHaveBeenCalledWith(
        churnInterventionByProductIdQuery,
        {
          stripeProductId: null,
          offeringApiIdentifier,
          interval: subplatInterval,
          churnType: 'cancel',
          locale: 'en',
        }
      );

      expect(result).toBeInstanceOf(ChurnInterventionByProductIdResultUtil);
      expect(result.churnInterventionByProductId.offerings).toHaveLength(1);
    });
  });

  describe('getChurnInterventionForSubscription', () => {
    it('returns SubplatInterval based on subscription', async () => {
      const queryData = ChurnInterventionByProductIdQueryFactory();
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const stripeProductId = mockSubscription.items.data.at(0)?.price
        .product as string;
      const stripeInterval =
        mockSubscription.items.data.at(0)?.price.recurring?.interval;
      const intervalCount =
        mockSubscription.items.data.at(0)?.price.recurring?.interval_count;
      const interval = getSubplatInterval(
        stripeInterval as string,
        intervalCount as number
      );

      const result =
        await productConfigurationManager.getChurnInterventionBySubscription(
          mockSubscription.id,
          'cancel',
          'en'
        );

      expect(strapiClient.query).toHaveBeenCalledWith(
        churnInterventionByProductIdQuery,
        {
          stripeProductId,
          offeringApiIdentifier: null,
          interval,
          churnType: 'cancel',
          locale: 'en',
        }
      );

      expect(result).toBeInstanceOf(ChurnInterventionByProductIdResultUtil);
      expect(result.churnInterventionByProductId.offerings).toHaveLength(1);
    });
  });

  describe('getCancelInterstitialOffer', () => {
    it('returns cancel interstitial offer based on parameters', async () => {
      const queryData = CancelInterstitialOfferResultFactory();
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);
      jest.spyOn(strapiClient, 'getLocale').mockResolvedValue('en');

      const offeringApiIdentifier = faker.string.sample();
      const currentInterval = faker.helpers.enumValue(SubplatInterval);
      const upgradeInterval = faker.helpers.enumValue(SubplatInterval);

      const result =
        await productConfigurationManager.getCancelInterstitialOffer(
          offeringApiIdentifier,
          currentInterval,
          upgradeInterval
        );
      expect(strapiClient.query).toHaveBeenCalledWith(
        cancelInterstitialOfferQuery,
        {
          offeringApiIdentifier,
          currentInterval,
          upgradeInterval,
          locale: 'en',
        }
      );

      expect(result).toBeInstanceOf(CancelInterstitialOfferUtil);
      expect(
        result.cancelInterstitialOffer.cancelInterstitialOffers
      ).toHaveLength(1);
    });
  });

  describe('getFreeTrial', () => {
    it('returns free trials based on offering api identifier', async () => {
      const queryData = FreeTrialResultFactory();
      jest.spyOn(strapiClient, 'query').mockResolvedValue(queryData);

      const apiIdentifier = faker.string.sample();

      const result =
        await productConfigurationManager.getFreeTrial(apiIdentifier);

      expect(strapiClient.query).toHaveBeenCalledWith(
        freeTrialQuery,
        { apiIdentifier }
      );

      expect(result).toBeInstanceOf(FreeTrialUtil);
      expect(result.freeTrial.freeTrials).toHaveLength(1);
    });
  });
});
