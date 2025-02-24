/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { Stripe } from 'stripe';

import { ProductManager } from './product.manager';
import { PromotionCodeManager } from './promotionCode.manager';
import {
  StripeClient,
  StripeApiListFactory,
  StripeResponseFactory,
  StripeCustomerFactory,
  StripePriceFactory,
  StripeProductFactory,
  StripePromotionCodeFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
  MockStripeConfigProvider,
  StripeCouponFactory,
} from '@fxa/payments/stripe';
import {
  CouponErrorInvalid,
  PromotionCodeCouldNotBeAttachedError,
} from './error';
import { STRIPE_PRICE_METADATA } from './types';
import { SubscriptionManager } from './subscription.manager';

import { assertPromotionCodeActive } from '../lib/util/assertPromotionCodeActive';
jest.mock('../lib/util/assertPromotionCodeActive');
const mockedAssertPromotionCodeActive = jest.mocked(assertPromotionCodeActive);

import { assertPromotionCodeApplicableToPrice } from '../lib/util/assertPromotionCodeApplicableToPrice';
jest.mock('../lib/util/assertPromotionCodeApplicableToPrice');
const mockedAssertPromotionCodeApplicableToPrice = jest.mocked(
  assertPromotionCodeApplicableToPrice
);

import { getPriceFromSubscription } from '../lib/util/getPriceFromSubscription';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
jest.mock('../lib/util/getPriceFromSubscription');
const mockedGetPriceFromSubscription = jest.mocked(getPriceFromSubscription);

describe('PromotionCodeManager', () => {
  let promotionCodeManager: PromotionCodeManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        ProductManager,
        PromotionCodeManager,
        StripeClient,
        SubscriptionManager,
        MockStatsDProvider,
      ],
    }).compile();

    promotionCodeManager = module.get(PromotionCodeManager);
    stripeClient = module.get(StripeClient);
  });

  describe('retrieve', () => {
    it('retrieves promotion code', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockResponse = StripeResponseFactory(mockPromotionCode);

      jest
        .spyOn(stripeClient, 'promotionCodesRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await promotionCodeManager.retrieve(mockPromotionCode.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieveByName', () => {
    it('queries for promotionCodes from stripe and returns first', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPromotionCode2 = StripePromotionCodeFactory();
      const mockPromotionCodesResponse = StripeApiListFactory([
        mockPromotionCode,
        mockPromotionCode2,
      ]);

      jest
        .spyOn(stripeClient, 'promotionCodesList')
        .mockResolvedValue(StripeResponseFactory(mockPromotionCodesResponse));

      const result = await promotionCodeManager.retrieveByName(
        mockPromotionCode.code
      );
      expect(result).toEqual(mockPromotionCode);
    });
  });

  describe('assertValidPromotionCodeForPrice', () => {
    it('resolves when valid', () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();
      const mockProduct = StripeProductFactory();

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedAssertPromotionCodeApplicableToPrice.mockReturnValue();

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      expect(
        promotionCodeManager.assertValidPromotionCodeForPrice(
          mockPromotionCode,
          mockPrice
        )
      ).resolves.toEqual(undefined);
    });

    it('throws an error if promotion code is invalid', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();

      mockedAssertPromotionCodeActive.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          'Invalid promotion code'
        );
      });

      await expect(
        promotionCodeManager.assertValidPromotionCodeForPrice(
          mockPromotionCode,
          mockPrice
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if promotion code is not applicable to price/product', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();
      const mockProduct = StripeProductFactory();

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedAssertPromotionCodeApplicableToPrice.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          'Invalid promotion code'
        );
      });

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      await expect(
        promotionCodeManager.assertValidPromotionCodeForPrice(
          mockPromotionCode,
          mockPrice
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });
  });

  describe('assertValidPromotionCodeNameForPrice', () => {
    it('resolves correctly when valid', async () => {
      const mockPrice = StripePriceFactory();
      const mockPromotionCode = StripePromotionCodeFactory({
        coupon: StripeCouponFactory({
          currency: mockPrice.currency,
        }),
      });
      const mockCartCurrency = mockPrice.currency;

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockResolvedValue();

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).resolves.toEqual(undefined);
    });

    it('throws an error if promotion code is not found', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();
      const mockCartCurrency = mockPrice.currency;

      jest
        .spyOn(stripeClient, 'promotionCodesList')
        .mockResolvedValue(StripeResponseFactory(StripeApiListFactory([])));

      await expect(() =>
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if promotion code is not valid', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();
      const mockCartCurrency = mockPrice.currency;

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockRejectedValue(
          new PromotionCodeCouldNotBeAttachedError('Invalid promotion code')
        );

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if currencies do no match', async () => {
      const mockPrice = StripePriceFactory({
        currency: 'cad',
      });
      const mockPromotionCode = StripePromotionCodeFactory({
        coupon: StripeCouponFactory({
          currency: 'cad',
        }),
      });
      const mockCartCurrency = 'usd';

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice,
          mockCartCurrency
        )
      ).rejects.toBeInstanceOf(CouponErrorInvalid);
    });
  });

  describe('applyPromoCodeToSubscription', () => {
    it('throws an error if the subscription is not active', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromoId = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory({
        status: 'canceled',
      });
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockResponse);

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromoId
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if the customer of the subscription does not match customerId', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromoId = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory({
        status: 'active',
      });
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockResponse);

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromoId
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if promotion code is invalid', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPromoResponse = StripeResponseFactory(undefined);
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        status: 'active',
      });
      const mockSubResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockedAssertPromotionCodeActive.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          'Invalid promotion code'
        );
      });

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if no subscription price exists', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPromoResponse = StripeResponseFactory(mockPromotionCode);
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        status: 'active',
      });
      const mockSubResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedGetPriceFromSubscription.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          'Unknown subscription price'
        );
      });

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if the promotion code is not one from the product', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockProduct = StripeProductFactory();
      const mockPromotionCode = StripePromotionCodeFactory({
        active: true,
      });
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        status: 'active',
      });
      const mockSubResponse = StripeResponseFactory(mockSubscription);
      const mockPromoResponse = StripeResponseFactory(mockPromotionCode);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedGetPriceFromSubscription.mockReturnValue(mockPrice);

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      mockedAssertPromotionCodeApplicableToPrice.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          "Promotion code restricted to a product or specific price that doesn't match the product or price on this subscription"
        );
      });

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if error is StripeInvalidRequestError', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscriptionId = 'sub_id1';
      const mockPromotionId = 'promo_id1';

      const stripeError = new Stripe.errors.StripeInvalidRequestError({
        type: 'invalid_request_error',
      });

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockImplementation(() => {
          throw stripeError;
        });

      await expect(
        promotionCodeManager.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscriptionId,
          mockPromotionId
        )
      ).rejects.toThrow(PromotionCodeCouldNotBeAttachedError);
    });

    it('returns the updated subscription with the promotion code successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockPromotionCode = StripePromotionCodeFactory({
        id: 'promo_code2',
        active: true,
      });
      const mockPromoCodeResponse = StripeResponseFactory(mockPromotionCode);
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        items: StripeApiListFactory([
          StripeSubscriptionItemFactory({
            price: StripePriceFactory({
              metadata: {
                [STRIPE_PRICE_METADATA.PromotionCodes]: 'promo_code1',
              },
            }),
          }),
        ]),
        status: 'active',
      });
      const mockUpdatedSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        items: StripeApiListFactory([
          StripeSubscriptionItemFactory({
            price: StripePriceFactory({
              metadata: {
                [STRIPE_PRICE_METADATA.PromotionCodes]:
                  'promo_code1,promo_code2',
              },
            }),
          }),
        ]),
        status: 'active',
      });
      const mockSubResponse1 = StripeResponseFactory(mockSubscription);
      const mockSubResponse2 = StripeResponseFactory(mockUpdatedSubscription);
      const mockProduct = StripeProductFactory();

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockSubResponse1);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoCodeResponse);

      mockedAssertPromotionCodeActive.mockReturnValue();
      mockedGetPriceFromSubscription.mockReturnValue(mockPrice);
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockResolvedValue();

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      jest
        .spyOn(stripeClient, 'subscriptionsUpdate')
        .mockResolvedValue(mockSubResponse2);

      const result = await promotionCodeManager.applyPromoCodeToSubscription(
        mockCustomer.id,
        mockSubscription.id,
        mockPromotionCode.id
      );
      expect(result).toEqual(mockSubResponse2);
    });
  });
});
