/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockStripeUtil = {
  checkValidPromotionCode: jest.fn(),
  checkSubscriptionPromotionCodes: jest.fn(),
  getSubscribedPrice: jest.fn(),
};

jest.mock('../lib/stripe.util.ts', () => mockStripeUtil);

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

import { StripeClient } from './stripe.client';
import { MockStripeConfigProvider } from './stripe.config';
import { PromotionCodeCouldNotBeAttachedError } from './stripe.error';
import { ProductManager } from './product.manager';
import { StripeService } from './stripe.service';
import { STRIPE_PRICE_METADATA } from './stripe.types';
import { SubscriptionManager } from './subscription.manager';
import { PromotionCodeManager } from './promotionCode.manager';

describe('StripeService', () => {
  let stripeService: StripeService;
  let productManager: ProductManager;
  let subscriptionManager: SubscriptionManager;
  let promotionCodeManager: PromotionCodeManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        StripeClient,
        ProductManager,
        SubscriptionManager,
        PromotionCodeManager,
        StripeService,
      ],
    }).compile();

    productManager = module.get(ProductManager);
    subscriptionManager = module.get(SubscriptionManager);
    promotionCodeManager = module.get(PromotionCodeManager);
    stripeService = module.get(StripeService);
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
        stripeService.applyPromoCodeToSubscription(
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
        stripeService.applyPromoCodeToSubscription(
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

      mockStripeUtil.checkValidPromotionCode.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          'Invalid promotion code'
        );
      });

      await expect(
        stripeService.applyPromoCodeToSubscription(
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

      mockStripeUtil.checkValidPromotionCode.mockReturnValue(true);
      mockStripeUtil.getSubscribedPrice.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          'Unknown subscription price'
        );
      });

      await expect(
        stripeService.applyPromoCodeToSubscription(
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

      mockStripeUtil.checkValidPromotionCode.mockReturnValue(true);
      mockStripeUtil.getSubscribedPrice.mockReturnValue(mockPrice);

      jest
        .spyOn(productManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      mockStripeUtil.checkSubscriptionPromotionCodes.mockImplementation(() => {
        throw new PromotionCodeCouldNotBeAttachedError(
          "Promotion code restricted to a product that doesn't match the product on this subscription"
        );
      });

      await expect(
        stripeService.applyPromoCodeToSubscription(
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
        stripeService.applyPromoCodeToSubscription(
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

      mockStripeUtil.checkValidPromotionCode.mockReturnValue(true);
      mockStripeUtil.getSubscribedPrice.mockReturnValue(mockPrice);
      mockStripeUtil.checkSubscriptionPromotionCodes.mockReturnValue(true);

      jest
        .spyOn(productManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockProduct));

      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockSubResponse2);

      const result = await stripeService.applyPromoCodeToSubscription(
        mockCustomer.id,
        mockSubscription.id,
        mockPromotionCode.id
      );
      expect(result).toEqual(mockSubResponse2);
    });
  });
});
