/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { Stripe } from 'stripe';

import {
  StripeApiListFactory,
  StripeResponseFactory,
} from './factories/api-list.factory';
import { StripeCustomerFactory } from './factories/customer.factory';
import { StripePriceFactory } from './factories/price.factory';
import { StripeProductFactory } from './factories/product.factory';
import { StripePromotionCodeFactory } from './factories/promotion-code.factory';
import {
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from './factories/subscription.factory';
import { ProductManager } from './product.manager';
import { PromotionCodeManager } from './promotionCode.manager';
import { StripeClient } from './stripe.client';
import { MockStripeConfigProvider } from './stripe.config';
import { PromotionCodeCouldNotBeAttachedError } from './stripe.error';
import { STRIPE_PRICE_METADATA } from './stripe.types';
import { SubscriptionManager } from './subscription.manager';
import * as StripeUtil from '../lib/stripe.util';

jest.mock('../lib/stripe.util.ts');

const mockStripeUtil = jest.mocked(StripeUtil);

describe('PromotionCodeManager', () => {
  let productManager: ProductManager;
  let promotionCodeManager: PromotionCodeManager;
  let stripeClient: StripeClient;
  let subscriptionManager: SubscriptionManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        ProductManager,
        PromotionCodeManager,
        StripeClient,
        SubscriptionManager,
      ],
    }).compile();

    productManager = module.get(ProductManager);
    promotionCodeManager = module.get(PromotionCodeManager);
    stripeClient = module.get(StripeClient);
    subscriptionManager = module.get(SubscriptionManager);
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

      mockStripeUtil.assertValidPromotionCode.mockReturnValue();
      mockStripeUtil.assertSubscriptionPromotionCodes.mockReturnValue();

      jest
        .spyOn(productManager, 'retrieve')
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

      mockStripeUtil.assertValidPromotionCode.mockImplementation(() => {
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

      mockStripeUtil.assertValidPromotionCode.mockReturnValue();
      mockStripeUtil.assertSubscriptionPromotionCodes.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          'Invalid promotion code'
        );
      });

      jest
        .spyOn(productManager, 'retrieve')
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
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();

      jest
        .spyOn(promotionCodeManager, 'retrieveByName')
        .mockResolvedValue(mockPromotionCode);
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeForPrice')
        .mockResolvedValue();

      await expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice
        )
      ).resolves.toEqual(undefined);
    });

    it('throws an error if promotion code is not found', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();

      jest
        .spyOn(stripeClient, 'promotionCodesList')
        .mockResolvedValue(StripeResponseFactory(StripeApiListFactory([])));

      await expect(() =>
        promotionCodeManager.assertValidPromotionCodeNameForPrice(
          mockPromotionCode.code,
          mockPrice
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
    });

    it('throws an error if promotion code is not valid', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPrice = StripePriceFactory();

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
          mockPrice
        )
      ).rejects.toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
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
        .spyOn(subscriptionManager, 'retrieve')
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
        .spyOn(subscriptionManager, 'retrieve')
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
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockStripeUtil.assertValidPromotionCode.mockImplementation(() => {
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
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockStripeUtil.assertValidPromotionCode.mockReturnValue();
      mockStripeUtil.getSubscribedPrice.mockImplementation(() => {
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
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoResponse);

      mockStripeUtil.assertValidPromotionCode.mockReturnValue();
      mockStripeUtil.getSubscribedPrice.mockReturnValue(mockPrice);

      jest
        .spyOn(productManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      mockStripeUtil.assertSubscriptionPromotionCodes.mockImplementation(() => {
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

      jest.spyOn(subscriptionManager, 'retrieve').mockImplementation(() => {
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
                [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo_code1',
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
                [STRIPE_PRICE_METADATA.PROMOTION_CODES]:
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
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubResponse1);

      jest
        .spyOn(promotionCodeManager, 'retrieve')
        .mockResolvedValue(mockPromoCodeResponse);

      mockStripeUtil.assertValidPromotionCode.mockReturnValue();
      mockStripeUtil.getSubscribedPrice.mockReturnValue(mockPrice);
      mockStripeUtil.assertSubscriptionPromotionCodes.mockReturnValue();

      jest
        .spyOn(productManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      jest
        .spyOn(subscriptionManager, 'update')
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
