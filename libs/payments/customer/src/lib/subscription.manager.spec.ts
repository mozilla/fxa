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
  StripeInvoiceFactory,
  StripePaymentIntentFactory,
  StripeSubscriptionFactory,
  MockStripeConfigProvider,
} from '@fxa/payments/stripe';
import { STRIPE_SUBSCRIPTION_METADATA } from './types';
import { SubscriptionManager } from './subscription.manager';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

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

      expect(stripeClient.subscriptionsCancel).toBeCalledWith(
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

  describe('cancel', () => {
    it('calls stripeclient', async () => {
      const mockSubscription = StripeSubscriptionFactory();

      jest
        .spyOn(stripeClient, 'subscriptionsCancel')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));

      await subscriptionManager.cancel(mockSubscription.id);

      expect(stripeClient.subscriptionsCancel).toBeCalledWith(
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

      expect(stripeClient.subscriptionsCreate).toBeCalledWith(params, options);
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

      expect(stripeClient.subscriptionsRetrieve).toBeCalledWith(
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

      expect(stripeClient.subscriptionsUpdate).toBeCalledWith(
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

      expect(stripeClient.subscriptionsUpdate).toBeCalledWith(
        mockSubscription.id,
        mockParams
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws if metadata key does not match', async () => {
      const mockParams = {
        metadata: {
          amount: '1200',
          [STRIPE_SUBSCRIPTION_METADATA.SubscriptionPromotionCode]:
            'test-coupon',
          promotionCode: 'test-coupon',
        },
      };
      const mockSubscription = StripeSubscriptionFactory(mockParams);

      expect(() =>
        subscriptionManager.update(mockSubscription.id, mockParams)
      ).rejects.toThrow('Invalid metadata key: promotionCode');
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

  describe('getLatestPaymentIntent', () => {
    it('fetches the latest payment intent for the subscription', async () => {
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());
      const mockPaymentIntent = StripeResponseFactory(
        StripePaymentIntentFactory()
      );

      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);

      jest
        .spyOn(stripeClient, 'paymentIntentRetrieve')
        .mockResolvedValue(mockPaymentIntent);

      const result = await subscriptionManager.getLatestPaymentIntent(
        mockSubscription
      );

      expect(result).toEqual(mockPaymentIntent);
    });

    it('returns undefined if no invoice on subscription', async () => {
      const mockSubscription = StripeSubscriptionFactory({
        latest_invoice: null,
      });

      const result = await subscriptionManager.getLatestPaymentIntent(
        mockSubscription
      );

      expect(result).toEqual(undefined);
    });

    it('returns undefined if the invoice has no payment intent', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          payment_intent: null,
        })
      );

      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);

      const result = await subscriptionManager.getLatestPaymentIntent(
        mockSubscription
      );

      expect(result).toEqual(undefined);
    });
  });
});
