/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { CustomerFactory } from './factories/customer.factory';
import { InvoiceFactory } from './factories/invoice.factory';
import { SubscriptionListFactory } from './factories/subscription.factory';
import { StripeClient } from './stripe.client';

describe('StripeClient', () => {
  let mockClient: StripeClient;

  beforeEach(() => {
    mockClient = new StripeClient({
      apiKey: faker.string.uuid(),
    });
  });

  it('should be defined', () => {
    expect(mockClient).toBeDefined();
  });

  describe('fetchCustomer', () => {
    it('returns an existing customer from Stripe', async () => {
      const mockCustomer = CustomerFactory();

      mockClient.stripe.customers.retrieve = jest
        .fn()
        .mockResolvedValueOnce(mockCustomer);

      const result = await mockClient.fetchCustomer(mockCustomer.id);
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('fetchSubscriptions', () => {
    it('returns subscriptions from Stripe', async () => {
      const mockCustomer = CustomerFactory();
      const mockSubscriptionList = SubscriptionListFactory();

      mockClient.stripe.subscriptions.list = jest
        .fn()
        .mockResolvedValueOnce(mockSubscriptionList);

      const result = await mockClient.fetchSubscriptions(mockCustomer.id);
      expect(result).toEqual(mockSubscriptionList);
    });
  });

  describe('finalizeInvoice', () => {
    it('works successfully', async () => {
      const mockInvoice = InvoiceFactory({
        auto_advance: false,
      });

      mockClient.stripe.invoices.finalizeInvoice = jest
        .fn()
        .mockResolvedValueOnce({});

      const result = await mockClient.finalizeInvoice(mockInvoice.id, {
        auto_advance: false,
      });

      expect(result).toEqual({});
      expect(mockClient.stripe.invoices.finalizeInvoice).toBeCalledWith(
        mockInvoice.id,
        { auto_advance: false }
      );
    });
  });
});
