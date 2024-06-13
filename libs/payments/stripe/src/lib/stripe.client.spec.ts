/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { Stripe } from 'stripe';

import {
  StripeApiListFactory,
  StripeResponseFactory,
} from './factories/api-list.factory';
import { StripeCustomerFactory } from './factories/customer.factory';
import { StripeInvoiceFactory } from './factories/invoice.factory';
import { StripePriceFactory } from './factories/price.factory';
import { StripeProductFactory } from './factories/product.factory';
import { StripePromotionCodeFactory } from './factories/promotion-code.factory';
import { StripeSubscriptionFactory } from './factories/subscription.factory';
import { StripeUpcomingInvoiceFactory } from './factories/upcoming-invoice.factory';
import { StripeClient } from './stripe.client';
import { MockStripeConfigProvider } from './stripe.config';

const mockJestFnGenerator = <T extends (...args: any[]) => any>() => {
  return jest.fn<ReturnType<T>, Parameters<T>>();
};
const mockStripeCustomersRetrieve =
  mockJestFnGenerator<typeof Stripe.prototype.customers.retrieve>();
const mockStripeCustomersCreate =
  mockJestFnGenerator<typeof Stripe.prototype.customers.create>();
const mockStripeCustomersUpdate =
  mockJestFnGenerator<typeof Stripe.prototype.customers.update>();
const mockStripeRetrieveUpcomingInvoice =
  mockJestFnGenerator<typeof Stripe.prototype.invoices.retrieveUpcoming>();
const mockStripeInvoicesFinalizeInvoice =
  mockJestFnGenerator<typeof Stripe.prototype.invoices.finalizeInvoice>();
const mockStripeInvoicesRetrieve =
  mockJestFnGenerator<typeof Stripe.prototype.invoices.retrieve>();
const mockStripePricesRetrieve =
  mockJestFnGenerator<typeof Stripe.prototype.prices.retrieve>();
const mockStripeProductsRetrieve =
  mockJestFnGenerator<typeof Stripe.prototype.products.retrieve>();
const mockStripePromotionCodesList =
  mockJestFnGenerator<typeof Stripe.prototype.promotionCodes.list>();
const mockStripePromotionCodesRetrieve =
  mockJestFnGenerator<typeof Stripe.prototype.promotionCodes.retrieve>();
const mockStripeSubscriptionsList =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.list>();
const mockStripeSubscriptionsCreate =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.create>();
const mockStripeSubscriptionsCancel =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.cancel>();
const mockStripeSubscriptionsRetrieve =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.retrieve>();
const mockStripeSubscriptionsUpdate =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.update>();

jest.mock('stripe', () => ({
  Stripe: function () {
    return {
      customers: {
        create: mockStripeCustomersCreate,
        retrieve: mockStripeCustomersRetrieve,
        update: mockStripeCustomersUpdate,
      },
      invoices: {
        finalizeInvoice: mockStripeInvoicesFinalizeInvoice,
        retrieve: mockStripeInvoicesRetrieve,
        retrieveUpcoming: mockStripeRetrieveUpcomingInvoice,
      },
      prices: {
        retrieve: mockStripePricesRetrieve,
      },
      products: {
        retrieve: mockStripeProductsRetrieve,
      },
      promotionCodes: {
        list: mockStripePromotionCodesList,
        retrieve: mockStripePromotionCodesRetrieve,
      },
      subscriptions: {
        create: mockStripeSubscriptionsCreate,
        cancel: mockStripeSubscriptionsCancel,
        list: mockStripeSubscriptionsList,
        retrieve: mockStripeSubscriptionsRetrieve,
        update: mockStripeSubscriptionsUpdate,
      },
    };
  },
}));

describe('StripeClient', () => {
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockStripeConfigProvider, StripeClient],
    }).compile();

    stripeClient = module.get(StripeClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('customersRetrieve', () => {
    it('returns an existing customer from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockResponse = StripeResponseFactory(mockCustomer);

      mockStripeCustomersRetrieve.mockResolvedValueOnce(mockResponse);

      const result = await stripeClient.customersRetrieve(mockCustomer.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('customersCreate', () => {
    it('creates a customer within Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockResponse = StripeResponseFactory(mockCustomer);

      mockStripeCustomersCreate.mockResolvedValueOnce(mockResponse);

      const result = await stripeClient.customersCreate();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('customersUpdate', () => {
    it('updates an existing customer from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockUpdatedCustomer = StripeCustomerFactory();
      const mockResponse = StripeResponseFactory(mockUpdatedCustomer);

      mockStripeCustomersUpdate.mockResolvedValueOnce(mockResponse);

      const result = await stripeClient.customersUpdate(mockCustomer.id, {
        balance: mockUpdatedCustomer.balance,
      });

      expect(result.balance).toEqual(mockUpdatedCustomer.balance);
    });
  });

  describe('subscriptionsList', () => {
    it('returns subscriptions from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscriptionList = StripeResponseFactory(
        StripeApiListFactory([StripeSubscriptionFactory()])
      );

      mockStripeSubscriptionsList.mockResolvedValue(mockSubscriptionList);

      const result = await stripeClient.subscriptionsList({
        customer: mockCustomer.id,
      });
      expect(result).toEqual(mockSubscriptionList);
    });
  });

  describe('subscriptionsCreate', () => {
    it('creates subscription within Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory();
      const mockResponse = StripeResponseFactory(mockSubscription);

      mockStripeSubscriptionsCreate.mockResolvedValue(mockResponse);

      const result = await stripeClient.subscriptionsCreate({
        customer: mockCustomer.id,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('subscriptionsCancel', () => {
    it('cancels a subscription within Stripe', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockResponse = StripeResponseFactory(mockSubscription);

      mockStripeSubscriptionsCancel.mockResolvedValue(mockResponse);

      const result = await stripeClient.subscriptionsCancel(
        mockSubscription.id
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('subscriptionsRetrieve', () => {
    it('retrieves a subscription within Stripe', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockResponse = StripeResponseFactory(mockSubscription);

      mockStripeSubscriptionsRetrieve.mockResolvedValue(mockResponse);

      const result = await stripeClient.subscriptionsRetrieve(
        mockSubscription.id
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('subscriptionsUpdate', () => {
    it('updates a subscription within Stripe', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockUpdatedSubscription = StripeSubscriptionFactory({
        description: 'This is an updated description.',
      });
      const mockResponse = StripeResponseFactory(mockUpdatedSubscription);

      mockStripeSubscriptionsUpdate.mockResolvedValue(mockResponse);

      const result = await stripeClient.subscriptionsUpdate(
        mockSubscription.id
      );
      expect(result.description).toEqual(mockUpdatedSubscription.description);
    });
  });

  describe('invoicesRetrieve', () => {
    it('works successfully', async () => {
      const mockInvoice = StripeInvoiceFactory();
      const mockResponse = StripeResponseFactory(mockInvoice);

      mockStripeInvoicesRetrieve.mockResolvedValue(mockResponse);

      const result = await stripeClient.invoicesRetrieve(mockInvoice.id);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('invoicesRetrieveUpcoming', () => {
    it('calls stripe successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockInvoice = StripeUpcomingInvoiceFactory();
      const mockResponse = StripeResponseFactory(mockInvoice);

      mockStripeRetrieveUpcomingInvoice.mockResolvedValue(mockResponse);

      const result = await stripeClient.invoicesRetrieveUpcoming({
        customer: mockCustomer.id,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('invoicesFinalizeInvoice', () => {
    it('works successfully', async () => {
      const mockInvoice = StripeInvoiceFactory({
        auto_advance: false,
      });
      const mockResponse = StripeResponseFactory(mockInvoice);

      mockStripeInvoicesFinalizeInvoice.mockResolvedValue(mockResponse);

      const result = await stripeClient.invoicesFinalizeInvoice(
        mockInvoice.id,
        {
          auto_advance: false,
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('pricesRetrieve', () => {
    it('retrieves price successfully', async () => {
      const mockPrice = StripePriceFactory();
      const mockResponse = StripeResponseFactory(mockPrice);

      mockStripePricesRetrieve.mockResolvedValue(mockResponse);

      const result = await stripeClient.pricesRetrieve(mockPrice.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('productsRetrieve', () => {
    it('retrieves product successfully', async () => {
      const mockProduct = StripeProductFactory();
      const mockResponse = StripeResponseFactory(mockProduct);

      mockStripeProductsRetrieve.mockResolvedValue(mockResponse);

      const result = await stripeClient.productsRetrieve(mockProduct.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('promotionCodesList', () => {
    it('returns promotion codes from Stripe', async () => {
      const mockPromoCode = StripePromotionCodeFactory();
      const mockPromoCodeList = StripeApiListFactory([mockPromoCode]);
      const mockResponse = StripeResponseFactory(mockPromoCodeList);

      mockStripePromotionCodesList.mockResolvedValue(mockResponse);

      const result = await stripeClient.promotionCodesList({
        code: mockPromoCode.code,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('promotionCodesRetrieve', () => {
    it('retrieves promotion code successfully', async () => {
      const mockPromoCode = StripePromotionCodeFactory();
      const mockResponse = StripeResponseFactory(mockPromoCode);

      mockStripePromotionCodesRetrieve.mockResolvedValue(mockResponse);

      const result = await stripeClient.promotionCodesRetrieve(
        mockPromoCode.id
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
