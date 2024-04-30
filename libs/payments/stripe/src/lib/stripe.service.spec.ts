/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import { StripeResponseFactory } from './factories/api-list.factory';
import { StripeCustomerFactory } from './factories/customer.factory';
import { StripePriceFactory } from './factories/price.factory';
import { StripePromotionCodeFactory } from './factories/promotion-code.factory';
import {
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from './factories/subscription.factory';

import {
  PromotionCodeCouldNotBeAttachedError,
  PromotionCodeInvalidError,
  PromotionCodeNotForSubscriptionError,
  SubscriptionPriceUnknownError,
} from './stripe.error';
import { StripeManager } from './stripe.manager';
import { StripeService } from './stripe.service';
import { STRIPE_PRICE_METADATA } from './stripe.types';

const mockIsValidPromotionCode = jest.fn();
const mockPromotionCodeIncluded = jest.fn();
const mockSubscribedPrice = jest.fn();

jest.mock('../lib/stripe.util.ts', () => {
  return {
    checkSubscriptionPromotionCodes: function () {
      return mockPromotionCodeIncluded();
    },
    checkValidPromotionCode: function () {
      return mockIsValidPromotionCode();
    },
    getSubscribedPrice: function () {
      return mockSubscribedPrice();
    },
  };
});

describe('StripeService', () => {
  let service: StripeService;
  let stripeManager: StripeManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeManager, StripeService],
    })
      .overrideProvider(StripeManager)
      .useValue({
        retrieveProduct: jest.fn(),
        retrievePromotionCode: jest.fn(),
        retrieveSubscription: jest.fn(),
        updateSubscription: jest.fn(),
      })
      .compile();

    stripeManager = module.get<StripeManager>(StripeManager);
    service = module.get<StripeService>(StripeService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(StripeService);
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
        .spyOn(stripeManager, 'retrieveSubscription')
        .mockResolvedValue(mockResponse);

      try {
        await service.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromoId
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
        expect(error.message).toEqual(
          'Promotion code could not be attached to subscription: Subscription is not active'
        );
      }
    });

    it('throws an error if the customer of the subscription does not match customerId', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPromoId = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory({
        status: 'active',
      });
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeManager, 'retrieveSubscription')
        .mockResolvedValue(mockResponse);

      try {
        await service.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromoId
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
        expect(error.message).toEqual(
          'Promotion code could not be attached to subscription: subscription.customerId does not match passed in customerId'
        );
      }
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
        .spyOn(stripeManager, 'retrieveSubscription')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(stripeManager, 'retrievePromotionCode')
        .mockResolvedValue(mockPromoResponse);

      mockIsValidPromotionCode.mockImplementation(() => {
        throw new PromotionCodeInvalidError();
      });

      try {
        await service.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
        expect(error.message).toEqual(
          'Promotion code could not be attached to subscription: Invalid promotion code'
        );
      }
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
        .spyOn(stripeManager, 'retrieveSubscription')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(stripeManager, 'retrievePromotionCode')
        .mockResolvedValue(mockPromoResponse);

      mockIsValidPromotionCode.mockReturnValue(true);
      mockSubscribedPrice.mockImplementation(() => {
        throw new SubscriptionPriceUnknownError();
      });

      try {
        await service.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
        expect(error.message).toEqual(
          'Promotion code could not be attached to subscription: Unknown subscription price'
        );
      }
    });

    it('throws an error if the promotion code is not one from the product', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
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
        .spyOn(stripeManager, 'retrieveSubscription')
        .mockResolvedValue(mockSubResponse);

      jest
        .spyOn(stripeManager, 'retrievePromotionCode')
        .mockResolvedValue(mockPromoResponse);

      mockIsValidPromotionCode.mockReturnValue(true);
      mockSubscribedPrice.mockReturnValue(mockPrice);
      mockPromotionCodeIncluded.mockImplementation(() => {
        throw new PromotionCodeNotForSubscriptionError();
      });

      try {
        await service.applyPromoCodeToSubscription(
          mockCustomer.id,
          mockSubscription.id,
          mockPromotionCode.id
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PromotionCodeCouldNotBeAttachedError);
        expect(error.message).toEqual(
          "Promotion code could not be attached to subscription: Promotion code restricted to a product that doesn't match the product on this subscription"
        );
      }
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
        items: {
          object: 'list',
          data: [
            StripeSubscriptionItemFactory({
              price: StripePriceFactory({
                metadata: {
                  [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo_code1',
                },
              }),
            }),
          ],
          has_more: false,
          url: `/v1/subscription_items?subscription=sub_${faker.string.alphanumeric(
            { length: 24 }
          )}`,
        },
        status: 'active',
      });
      const mockUpdatedSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
        items: {
          object: 'list',
          data: [
            StripeSubscriptionItemFactory({
              price: StripePriceFactory({
                metadata: {
                  [STRIPE_PRICE_METADATA.PROMOTION_CODES]:
                    'promo_code1,promo_code2',
                },
              }),
            }),
          ],
          has_more: false,
          url: `/v1/subscription_items?subscription=sub_${faker.string.alphanumeric(
            { length: 24 }
          )}`,
        },
        status: 'active',
      });
      const mockSubResponse1 = StripeResponseFactory(mockSubscription);
      const mockSubResponse2 = StripeResponseFactory(mockUpdatedSubscription);

      jest
        .spyOn(stripeManager, 'retrieveSubscription')
        .mockResolvedValue(mockSubResponse1);

      jest
        .spyOn(stripeManager, 'retrievePromotionCode')
        .mockResolvedValue(mockPromoCodeResponse);

      mockIsValidPromotionCode.mockReturnValue(true);
      mockSubscribedPrice.mockReturnValue(mockPrice);
      mockPromotionCodeIncluded.mockReturnValue(true);

      jest
        .spyOn(stripeManager, 'updateSubscription')
        .mockResolvedValue(mockSubResponse2);

      const result = await service.applyPromoCodeToSubscription(
        mockCustomer.id,
        mockSubscription.id,
        mockPromotionCode.id
      );
      expect(result).toEqual(mockSubResponse2);
    });
  });
});
