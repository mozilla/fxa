/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import {
  StripeClient,
  StripeApiListFactory,
  StripeResponseFactory,
  StripeCustomerFactory,
  StripeSubscriptionFactory,
  MockStripeConfigProvider,
  StripeRangeQueryParamFactory,
} from '@fxa/payments/stripe';
import { STRIPE_SUBSCRIPTION_METADATA } from './types';
import { SubscriptionManager } from './subscription.manager';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { SubscriptionCustomerMismatchError } from './customer.error';
import { StripeSubscriptionAsyncGeneratorFactory } from 'libs/payments/stripe/src/lib/factories/subscription.factory';

describe('SubscriptionManager', () => {
  let subscriptionManager: SubscriptionManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        StripeClient,
        SubscriptionManager,
        MockStatsDProvider,
      ],
    }).compile();

    subscriptionManager = module.get(SubscriptionManager);
    stripeClient = module.get(StripeClient);
  });

  describe('cancelIncompleteSubscriptionsToPrice', () => {
    it('cancels incomplete subscriptions', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory({
        status: 'incomplete',
      });
      const mockSubscriptionList = [mockSubscription];
      const mockPrice = mockSubscription.items.data[0].price;
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue(mockSubscriptionList);

      jest
        .spyOn(stripeClient, 'subscriptionsCancel')
        .mockResolvedValue(mockResponse);

      await subscriptionManager.cancelIncompleteSubscriptionsToPrice(
        mockCustomer.id,
        mockPrice.id
      );

      expect(stripeClient.subscriptionsCancel).toHaveBeenCalledWith(
        mockSubscription.id
      );
    });
  });

  describe('listForCustomer', () => {
    it('returns subscriptions', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockSubscriptionList = StripeApiListFactory([mockSubscription]);
      const mockCustomer = StripeCustomerFactory();

      const expected = mockSubscriptionList.data;

      jest
        .spyOn(stripeClient, 'subscriptionsList')
        .mockResolvedValue(mockSubscriptionList);

      const result = await subscriptionManager.listForCustomer(mockCustomer.id);
      expect(result).toEqual(expected);
    });

    it('returns empty array if no subscriptions exist', async () => {
      const mockCustomer = StripeCustomerFactory();

      jest
        .spyOn(stripeClient, 'subscriptionsList')
        .mockResolvedValue(StripeApiListFactory([]));

      const result = await subscriptionManager.listForCustomer(mockCustomer.id);
      expect(result).toEqual([]);
    });
  });

  describe('listCancelOnDateGenerator', () => {
    const mockCurrentPeriodEnd = StripeRangeQueryParamFactory();
    it('returns generator that yields subscriptions', async () => {
      const mockSubscription = StripeSubscriptionFactory({
        cancel_at_period_end: true,
      });
      const mockGenerator = StripeSubscriptionAsyncGeneratorFactory([
        mockSubscription,
      ]);
      const expected = mockSubscription;

      jest
        .spyOn(stripeClient, 'subscriptionsListGenerator')
        .mockReturnValue(mockGenerator);

      const generator =
        subscriptionManager.listCancelOnDateGenerator(mockCurrentPeriodEnd);
      const result = (await generator.next()).value;

      expect(result).toEqual(expected);
    });

    it('returns generator that yields no subscriptions', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockGenerator = StripeSubscriptionAsyncGeneratorFactory([
        mockSubscription,
      ]);

      jest
        .spyOn(stripeClient, 'subscriptionsListGenerator')
        .mockReturnValue(mockGenerator);

      const generator =
        subscriptionManager.listCancelOnDateGenerator(mockCurrentPeriodEnd);
      const result = (await generator.next()).value;

      expect(result).toEqual(undefined);
    });
  });

  describe('cancel', () => {
    it('calls stripeclient', async () => {
      const mockSubscription = StripeSubscriptionFactory();

      jest
        .spyOn(stripeClient, 'subscriptionsCancel')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));

      await subscriptionManager.cancel(mockSubscription.id);

      expect(stripeClient.subscriptionsCancel).toHaveBeenCalledWith(
        mockSubscription.id,
        undefined
      );
    });
  });

  describe('create', () => {
    it('calls stripeclient', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory();
      const mockResponse = StripeResponseFactory(mockSubscription);
      const params = {
        customer: mockCustomer.id,
      };
      const options = {
        idempotencyKey: faker.string.uuid(),
      };

      jest
        .spyOn(stripeClient, 'subscriptionsCreate')
        .mockResolvedValue(mockResponse);

      const result = await subscriptionManager.create(params, options);

      expect(stripeClient.subscriptionsCreate).toHaveBeenCalledWith(
        params,
        options
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieve', () => {
    it('calls stripeclient', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await subscriptionManager.retrieve(mockSubscription.id);

      expect(stripeClient.subscriptionsRetrieve).toHaveBeenCalledWith(
        mockSubscription.id
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('calls stripeclient', async () => {
      const mockParams = {
        description: 'This is an updated subscription',
      };
      const mockSubscription = StripeSubscriptionFactory(mockParams);
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsUpdate')
        .mockResolvedValue(mockResponse);

      const result = await subscriptionManager.update(
        mockSubscription.id,
        mockParams
      );

      expect(stripeClient.subscriptionsUpdate).toHaveBeenCalledWith(
        mockSubscription.id,
        mockParams
      );
      expect(result).toEqual(mockResponse);
    });

    it('updates metadata', async () => {
      const mockParams = {
        metadata: {
          [STRIPE_SUBSCRIPTION_METADATA.SubscriptionPromotionCode]:
            'test-coupon',
        },
      };
      const mockSubscription = StripeSubscriptionFactory(mockParams);
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsUpdate')
        .mockResolvedValue(mockResponse);

      const result = await subscriptionManager.update(
        mockSubscription.id,
        mockParams
      );

      expect(stripeClient.subscriptionsUpdate).toHaveBeenCalledWith(
        mockSubscription.id,
        mockParams
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieveForCustomerAndPrice', () => {
    const mockSubscription = StripeSubscriptionFactory();
    const mockCustomer = StripeCustomerFactory();
    const mockPriceId = mockSubscription.items.data[0].price.id;

    beforeEach(() => {
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
    });

    it('returns subscription for priceId', async () => {
      const result = await subscriptionManager.retrieveForCustomerAndPrice(
        mockCustomer.id,
        mockPriceId
      );
      expect(result).toEqual(mockSubscription);
    });

    it('returns undefined if no subscription is found for priceId', async () => {
      const result = await subscriptionManager.retrieveForCustomerAndPrice(
        mockCustomer.id,
        'randomprice'
      );
      expect(result).toEqual(undefined);
    });

    it('throws on unhandled error', async () => {
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockRejectedValue(new Error('unhandled error'));
      expect(
        subscriptionManager.retrieveForCustomerAndPrice(
          mockCustomer.id,
          mockPriceId
        )
      ).rejects.toThrow();
    });
  });

  describe('getCustomerPayPalSubscriptions', () => {
    it('return customer subscriptions where payment provider is paypal', async () => {
      const mockPayPalSubscription = StripeSubscriptionFactory({
        collection_method: 'send_invoice',
        status: 'active',
      });

      const mockCustomer = StripeCustomerFactory();

      const expected = [mockPayPalSubscription];

      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockPayPalSubscription]);

      const result = await subscriptionManager.getCustomerPayPalSubscriptions(
        mockCustomer.id
      );
      expect(result).toEqual(expected);
    });

    it('returns empty array when no subscriptions', async () => {
      const mockCustomer = StripeCustomerFactory();

      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValueOnce([]);

      const result = await subscriptionManager.getCustomerPayPalSubscriptions(
        mockCustomer.id
      );
      expect(result).toEqual([]);
    });
  });

  describe('getPaymentProvider', () => {
    it('returns stripe when collection_method is charge_automatically', async () => {
      const mockSubscription = StripeSubscriptionFactory({
        collection_method: 'charge_automatically',
      });

      const result = subscriptionManager.getPaymentProvider(mockSubscription);
      expect(result).toEqual('stripe');
    });

    it('returns paypal when collection_method is send_invoice', async () => {
      const mockSubscription = StripeSubscriptionFactory({
        collection_method: 'send_invoice',
      });

      const result = subscriptionManager.getPaymentProvider(mockSubscription);
      expect(result).toEqual('paypal');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('correctly returns active and cancelAtPeriodEnd when customerId matches', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory({
        status: 'active',
        cancel_at_period_end: true,
        customer: mockCustomer.id,
      });
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockResponse);

      const result = await subscriptionManager.getSubscriptionStatus(
        mockCustomer.id,
        mockSubscription.id
      );

      expect(subscriptionManager.retrieve).toHaveBeenCalledWith(
        mockSubscription.id
      );
      expect(result).toEqual({
        active: true,
        cancelAtPeriodEnd: true,
      });
    });

    it('throws an error when customerId does not match', async () => {
      const mockCustomer1 = StripeCustomerFactory();
      const mockCustomer2 = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer2.id,
      });
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValueOnce(mockResponse);

      await expect(
        subscriptionManager.getSubscriptionStatus(
          mockCustomer1.id,
          mockSubscription.id
        )
      ).rejects.toThrow(SubscriptionCustomerMismatchError);

      expect(subscriptionManager.retrieve).toHaveBeenCalledWith(
        mockSubscription.id
      );
    });
  });

  describe('applyStripeCouponToSubscription', () => {
    it('successfully applies coupon without setCancelAtPeriodEnd', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
      });
      const mockResponse = StripeResponseFactory(mockSubscription);
      const mockCouponId = 'coupon_123';
      const mockUpdatedSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
      });
      const mockUpdatedResponse = StripeResponseFactory(
        mockUpdatedSubscription
      );

      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockResponse);
      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockUpdatedResponse);

      const result = await subscriptionManager.applyStripeCouponToSubscription({
        customerId: mockCustomer.id,
        subscriptionId: mockSubscription.id,
        stripeCouponId: mockCouponId,
      });

      expect(subscriptionManager.retrieve).toHaveBeenCalledWith(
        mockSubscription.id
      );
      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          discounts: [{ coupon: mockCouponId }],
        }
      );
      expect(result).toEqual(mockUpdatedResponse);
    });

    it('successfully applies coupon with setCancelAtPeriodEnd', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
      });
      const mockResponse = StripeResponseFactory(mockSubscription);
      const mockCouponId = 'coupon_123';
      const mockUpdatedSubscription = StripeSubscriptionFactory({
        customer: mockCustomer.id,
      });
      const mockUpdatedResponse = StripeResponseFactory(
        mockUpdatedSubscription
      );

      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockResponse);
      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockUpdatedResponse);

      const result = await subscriptionManager.applyStripeCouponToSubscription({
        customerId: mockCustomer.id,
        subscriptionId: mockSubscription.id,
        stripeCouponId: mockCouponId,
        setCancelAtPeriodEnd: true,
      });

      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          discounts: [{ coupon: mockCouponId }],
          cancel_at_period_end: true,
        }
      );
      expect(result).toEqual(mockUpdatedResponse);
    });

    it('throws an error when customerId does not match', async () => {
      const mockCustomer1 = StripeCustomerFactory();
      const mockCustomer2 = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockCustomer2.id,
      });
      const mockResponse = StripeResponseFactory(mockSubscription);
      const mockCouponId = 'coupon_123';

      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValueOnce(mockResponse);

      await expect(
        subscriptionManager.applyStripeCouponToSubscription({
          customerId: mockCustomer1.id,
          subscriptionId: mockSubscription.id,
          stripeCouponId: mockCouponId,
        })
      ).rejects.toThrow(SubscriptionCustomerMismatchError);
      expect(jest.spyOn(subscriptionManager, 'update')).not.toHaveBeenCalled();
    });
  });
});
