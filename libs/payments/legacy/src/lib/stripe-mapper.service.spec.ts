/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Stripe } from 'stripe';

import { PriceManager } from '@fxa/payments/customer';
import {
  StripeClient,
  StripeConfig,
  StripePlanFactory,
  StripeProductFactory,
} from '@fxa/payments/stripe';
import {
  ProductConfigurationManager,
  PurchaseWithDetailsOfferingContentTransformedFactory,
  PurchaseWithDetailsOfferingContentUtil,
  PurchaseDetailsTransformedFactory,
  StrapiClient,
  MockStrapiClientConfigProvider,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { StripeMapperService } from './stripe-mapper.service';
import { MockStripeMapperConfigProvider } from './stripe-mapper.config';

jest.mock('@type-cacheable/core', () => ({
  Cacheable: () => {
    return (target: any, propertyKey: any, descriptor: any) => {
      return descriptor;
    };
  },
  CacheClear: () => {
    return (target: any, propertyKey: any, descriptor: any) => {
      return descriptor;
    };
  },
  setOptions: jest.fn(),
}));

jest.useFakeTimers();

describe('StripeMapperService', () => {
  let productConfigurationManager: ProductConfigurationManager;
  let stripeMapper: StripeMapperService;
  const mockCMSConfigUtil = {
    transformedPurchaseWithCommonContentForPlanId: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        MockStripeMapperConfigProvider,
        PriceManager,
        ProductConfigurationManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
        StripeMapperService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
          },
        },
      ],
    }).compile();

    productConfigurationManager = module.get(ProductConfigurationManager);
    stripeMapper = module.get(StripeMapperService);

    jest
      .spyOn(
        productConfigurationManager,
        'getPurchaseWithDetailsOfferingContentByPlanIds'
      )
      .mockResolvedValue(
        mockCMSConfigUtil as unknown as PurchaseWithDetailsOfferingContentUtil
      );
  });

  describe('mapCMSToStripePlans', () => {
    it('returns plan unchanged when product is not expanded', async () => {
      const stripePlan = StripePlanFactory({
        product: 'stringvalue',
        metadata: { foo: 'bar' },
      });
      const mappedPlans = await stripeMapper.mapCMSToStripePlans(
        [stripePlan],
        'en'
      );
      expect(mappedPlans[0]).toEqual(stripePlan);
    });

    it('returns plan unchanged when no CMS config is found', async () => {
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId.mockReturnValueOnce(
        undefined
      );
      const stripePlan = StripePlanFactory() as Stripe.Plan;
      stripePlan.product = StripeProductFactory({
        metadata: { foo: 'bar' },
      });
      const mappedPlans = await stripeMapper.mapCMSToStripePlans(
        [stripePlan],
        'en'
      );
      expect(mappedPlans[0]).toEqual(stripePlan);
    });

    it('overlays CMS values from default locale when no localizations are available', async () => {
      const expected = PurchaseWithDetailsOfferingContentTransformedFactory();
      expected.purchaseDetails.localizations = [];
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId.mockReturnValueOnce(
        expected
      );
      const productMetadata = {
        productSet: 'set',
        productOrder: 'order',
      };
      const stripePlan = StripePlanFactory() as Stripe.Plan;
      stripePlan.product = StripeProductFactory({
        metadata: productMetadata,
      });
      const mappedPlans = await stripeMapper.mapCMSToStripePlans(
        [stripePlan],
        'en'
      );
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(mappedPlans[0].metadata?.['webIconURL']).toBe(
        expected.purchaseDetails.webIcon
      );
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        expected.purchaseDetails.webIcon
      );
      expect(actualProduct.metadata?.['productSet']).toBe(
        productMetadata.productSet
      );
      expect(actualProduct.metadata?.['productOrder']).toBe(
        productMetadata.productOrder
      );
    });

    it('overlays CMS values from localizations when available', async () => {
      const expected = PurchaseWithDetailsOfferingContentTransformedFactory();
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId.mockReturnValueOnce(
        expected
      );
      const productMetadata = {
        productSet: 'set',
        productOrder: 'order',
      };
      const stripePlan = StripePlanFactory() as Stripe.Plan;
      stripePlan.product = StripeProductFactory({
        metadata: productMetadata,
      });
      const mappedPlans = await stripeMapper.mapCMSToStripePlans(
        [stripePlan],
        'en'
      );
      const actualProduct = mappedPlans[0].product as Stripe.Product;
      expect(mappedPlans[0].metadata?.['webIconURL']).toBe(
        expected.purchaseDetails.localizations[0].webIcon
      );
      expect(actualProduct.metadata?.['webIconURL']).toBe(
        expected.purchaseDetails.localizations[0].webIcon
      );
      expect(actualProduct.metadata?.['productSet']).toBe(
        productMetadata.productSet
      );
      expect(actualProduct.metadata?.['productOrder']).toBe(
        productMetadata.productOrder
      );
    });

    it('preserves plan metadata when overlaying multiple plans for the same product', async () => {
      const expected = PurchaseWithDetailsOfferingContentTransformedFactory({
        purchaseDetails: {
          localizations: [],
          ...PurchaseDetailsTransformedFactory({
            details: ['Detail 1 in English'],
          }),
        },
      });
      mockCMSConfigUtil.transformedPurchaseWithCommonContentForPlanId.mockReturnValue(
        expected
      );
      const productMetadata = {
        productSet: 'set',
        productOrder: 'order',
      };
      const product = StripeProductFactory({
        metadata: productMetadata,
      });
      const stripePlan1 = StripePlanFactory({
        metadata: { 'product:details:1': 'Detail 1 in English' },
      }) as Stripe.Plan;
      stripePlan1.product = product;
      const stripePlan2 = StripePlanFactory({
        metadata: {
          'product:details:1': 'Detail 1 in French',
          'product:details:2': 'Detail 2 in French',
        },
      }) as Stripe.Plan;
      stripePlan2.product = product;

      const mappedPlans = await stripeMapper.mapCMSToStripePlans(
        [stripePlan1, stripePlan2],
        'en'
      );

      expect(mappedPlans[0].metadata?.['product:details:1']).toBe(
        expected.purchaseDetails.details[0]
      );
      expect(mappedPlans[1].metadata?.['product:details:1']).toBe(
        expected.purchaseDetails.details[0]
      );
    });
  });
});
