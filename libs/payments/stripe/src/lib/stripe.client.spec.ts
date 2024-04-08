/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Stripe } from 'stripe';

import {
  StripeApiListFactory,
  StripeResponseFactory,
} from './factories/api-list.factory';
import { StripeCustomerFactory } from './factories/customer.factory';
import { StripeInvoiceFactory } from './factories/invoice.factory';
import { StripeUpcomingInvoiceFactory } from './factories/upcoming-invoice.factory';
import { StripeSubscriptionFactory } from './factories/subscription.factory';
import { StripeClient } from './stripe.client';

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
const mockStripeSubscriptionsList =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.list>();
const mockStripeSubscriptionsCreate =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.create>();
const mockStripeSubscriptionsCancel =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.cancel>();

jest.mock('stripe', () => ({
  Stripe: function () {
    return {
      customers: {
        retrieve: mockStripeCustomersRetrieve,
        create: mockStripeCustomersCreate,
        update: mockStripeCustomersUpdate,
      },
      invoices: {
        retrieve: mockStripeInvoicesRetrieve,
        retrieveUpcoming: mockStripeRetrieveUpcomingInvoice,
        finalizeInvoice: mockStripeInvoicesFinalizeInvoice,
      },
      subscriptions: {
        list: mockStripeSubscriptionsList,
        create: mockStripeSubscriptionsCreate,
        cancel: mockStripeSubscriptionsCancel,
      },
    };
  },
}));

describe('StripeClient', () => {
  let mockClient: StripeClient;

  beforeEach(() => {
    mockClient = new StripeClient({
      apiKey: faker.string.uuid(),
      taxIds: { EUR: 'EU1234' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('customersRetrieve', () => {
    it('returns an existing customer from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockResponse = StripeResponseFactory(mockCustomer);

      mockStripeCustomersRetrieve.mockResolvedValueOnce(mockResponse);

      const result = await mockClient.customersRetrieve(mockCustomer.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('customersCreate', () => {
    it('creates a customer within Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockResponse = StripeResponseFactory(mockCustomer);

      mockStripeCustomersCreate.mockResolvedValueOnce(mockResponse);

      const result = await mockClient.customersCreate();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('customersUpdate', () => {
    it('updates an existing customer from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockUpdatedCustomer = StripeCustomerFactory();
      const mockResponse = StripeResponseFactory(mockUpdatedCustomer);

      mockStripeCustomersUpdate.mockResolvedValueOnce(mockResponse);

      const result = await mockClient.customersUpdate(mockCustomer.id, {
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

      const result = await mockClient.subscriptionsList({
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

      const result = await mockClient.subscriptionsCreate({
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

      const result = await mockClient.subscriptionsCancel(mockSubscription.id);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('invoicesRetrieve', () => {
    it('works successfully', async () => {
      const mockInvoice = StripeInvoiceFactory();
      const mockResponse = StripeResponseFactory(mockInvoice);

      mockStripeInvoicesRetrieve.mockResolvedValue(mockResponse);

      const result = await mockClient.invoicesRetrieve(mockInvoice.id);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('invoicesRetrieveUpcoming', () => {
    it('calls stripe successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockInvoice = StripeUpcomingInvoiceFactory();
      const mockResponse = StripeResponseFactory(mockInvoice);

      mockStripeRetrieveUpcomingInvoice.mockResolvedValue(mockResponse);

      const result = await mockClient.invoicesRetrieveUpcoming({
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

      const result = await mockClient.invoicesFinalizeInvoice(mockInvoice.id, {
        auto_advance: false,
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
