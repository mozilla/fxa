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
import { StripeSubscriptionFactory } from './factories/subscription.factory';
import { StripeClient } from './stripe.client';

const mockJestFnGenerator = <T extends (...args: any[]) => any>() => {
  return jest.fn<ReturnType<T>, Parameters<T>>();
};
const mockStripeCustomersRetrieve =
  mockJestFnGenerator<typeof Stripe.prototype.customers.retrieve>();
const mockStripeCustomersUpdate =
  mockJestFnGenerator<typeof Stripe.prototype.customers.update>();
const mockStripeFinalizeInvoice =
  mockJestFnGenerator<typeof Stripe.prototype.invoices.finalizeInvoice>();
const mockStripeSubscriptionsList =
  mockJestFnGenerator<typeof Stripe.prototype.subscriptions.list>();

jest.mock('stripe', () => ({
  Stripe: function () {
    return {
      customers: {
        retrieve: mockStripeCustomersRetrieve,
        update: mockStripeCustomersUpdate,
      },
      invoices: {
        finalizeInvoice: mockStripeFinalizeInvoice,
      },
      subscriptions: {
        list: mockStripeSubscriptionsList,
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

  it('should be defined', () => {
    expect(mockClient).toBeDefined();
  });

  describe('fetchCustomer', () => {
    it('returns an existing customer from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockResponse = StripeResponseFactory(mockCustomer);

      mockStripeCustomersRetrieve.mockResolvedValueOnce(mockResponse);

      const result = await mockClient.fetchCustomer(mockCustomer.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateCustomer', () => {
    it('updates an existing customer from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockUpdatedCustomer = StripeCustomerFactory();
      const mockResponse = StripeResponseFactory(mockUpdatedCustomer);

      mockStripeCustomersUpdate.mockResolvedValueOnce(mockResponse);

      const result = await mockClient.updateCustomer(mockCustomer.id, {
        balance: mockUpdatedCustomer.balance,
      });

      expect(result.balance).toEqual(mockUpdatedCustomer.balance);
    });
  });

  describe('fetchSubscriptions', () => {
    it('returns subscriptions from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscriptionList = StripeResponseFactory(
        StripeApiListFactory([StripeSubscriptionFactory()])
      );

      mockStripeSubscriptionsList.mockResolvedValue(mockSubscriptionList);

      const result = await mockClient.fetchSubscriptions(mockCustomer.id);
      expect(result).toEqual(mockSubscriptionList);
    });
  });

  describe('finalizeInvoice', () => {
    it('works successfully', async () => {
      const mockInvoice = StripeInvoiceFactory({
        auto_advance: false,
      });
      const mockResponse = StripeResponseFactory(mockInvoice);

      mockStripeFinalizeInvoice.mockResolvedValue(mockResponse);

      const result = await mockClient.finalizeInvoice(mockInvoice.id, {
        auto_advance: false,
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
