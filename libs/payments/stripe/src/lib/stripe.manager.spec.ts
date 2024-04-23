/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';

import {
  StripeApiListFactory,
  StripeResponseFactory,
} from './factories/api-list.factory';
import { StripeCustomerFactory } from './factories/customer.factory';
import { StripeInvoiceFactory } from './factories/invoice.factory';
import { StripePlanFactory } from './factories/plan.factory';
import { StripeSubscriptionFactory } from './factories/subscription.factory';
import { StripeClient } from './stripe.client';
import { StripeConfig } from './stripe.config';
import {
  PlanIntervalMultiplePlansError,
  PlanNotFoundError,
} from './stripe.error';
import { StripeManager } from './stripe.manager';

describe('StripeManager', () => {
  let manager: StripeManager;
  let mockClient: StripeClient;
  let mockConfig: StripeConfig;

  beforeEach(async () => {
    mockClient = new StripeClient({
      apiKey: faker.string.uuid(),
      taxIds: { EUR: 'EU1234' },
    });

    mockConfig = {
      apiKey: faker.string.uuid(),
      taxIds: { EUR: 'EU1234' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: StripeClient, useValue: mockClient },
        { provide: StripeConfig, useValue: mockConfig },
        StripeManager,
      ],
    }).compile();

    manager = module.get<StripeManager>(StripeManager);
  });

  it('should be defined', async () => {
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(StripeManager);
  });

  describe('fetchActiveCustomer', () => {
    it('returns an existing customer from Stripe', async () => {
      const mockCustomer = StripeCustomerFactory();

      mockClient.customersRetrieve = jest
        .fn()
        .mockResolvedValueOnce(mockCustomer);

      const result = await manager.fetchActiveCustomer(mockCustomer.id);
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('finalizeInvoiceWithoutAutoAdvance', () => {
    it('works successfully', async () => {
      const mockInvoice = StripeInvoiceFactory({
        auto_advance: false,
      });

      mockClient.invoicesFinalizeInvoice = jest.fn().mockResolvedValueOnce({});

      const result = await manager.finalizeInvoiceWithoutAutoAdvance(
        mockInvoice.id
      );
      expect(result).toEqual({});
    });
  });

  describe('getMinimumAmount', () => {
    it('returns minimum amout for valid currency', () => {
      const expected = 50;
      const result = manager.getMinimumAmount('usd');

      expect(result).toEqual(expected);
    });

    it('should throw an error if currency is invalid', () => {
      expect(() => manager.getMinimumAmount('fake')).toThrow(
        'Currency does not have a minimum charge amount available.'
      );
    });
  });

  describe('getTaxIdForCurrency', () => {
    it('returns the correct tax id for currency', async () => {
      const mockCurrency = 'eur';

      const result = manager.getTaxIdForCurrency(mockCurrency);
      expect(result).toEqual('EU1234');
    });

    it('returns empty string when no  tax id found', async () => {
      const mockCurrency = faker.finance.currencyCode();

      const result = manager.getTaxIdForCurrency(mockCurrency);
      expect(result).toEqual(undefined);
    });
  });

  describe('cancelIncompleteSubscriptionsToPrice', () => {
    it('cancels incomplete subscriptions', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockSubscription = StripeSubscriptionFactory({
        status: 'incomplete',
      });
      const mockSubscriptionList = StripeApiListFactory([mockSubscription]);
      const mockPrice = mockSubscription.items.data[0].price;
      const mockResponse = StripeResponseFactory(mockSubscription);

      manager.getSubscriptions = jest
        .fn()
        .mockResolvedValueOnce(mockSubscriptionList);

      mockClient.subscriptionsCancel = jest
        .fn()
        .mockResolvedValueOnce(mockResponse);

      await manager.cancelIncompleteSubscriptionsToPrice(
        mockCustomer.id,
        mockPrice.id
      );

      expect(mockClient.subscriptionsCancel).toBeCalledWith(
        mockSubscription.id
      );
    });
  });

  describe('getSubscriptions', () => {
    it('returns subscriptions', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockSubscriptionList = StripeApiListFactory([mockSubscription]);
      const mockCustomer = StripeCustomerFactory();

      const expected = mockSubscriptionList;

      mockClient.subscriptionsList = jest
        .fn()
        .mockResolvedValueOnce(mockSubscriptionList);

      const result = await manager.getSubscriptions(mockCustomer.id);
      expect(result).toEqual(expected);
    });

    it('returns empty array if no subscriptions exist', async () => {
      const mockCustomer = StripeCustomerFactory();

      mockClient.subscriptionsList = jest.fn().mockResolvedValueOnce([]);

      const result = await manager.getSubscriptions(mockCustomer.id);
      expect(result).toEqual([]);
    });
  });

  describe('cancelSubscription', () => {
    it('calls stripeclient', async () => {
      const mockSubscription = StripeSubscriptionFactory();

      mockClient.subscriptionsCancel = jest
        .fn()
        .mockResolvedValueOnce(undefined);

      await manager.cancelSubscription(mockSubscription.id);
    });
  });

  describe('isCustomerStripeTaxEligible', () => {
    it('should return true for a taxable customer', async () => {
      const mockCustomer = StripeCustomerFactory({
        tax: {
          automatic_tax: 'supported',
          ip_address: null,
          location: { country: 'US', state: 'CA', source: 'billing_address' },
        },
      });

      const result = await manager.isCustomerStripeTaxEligible(mockCustomer);
      expect(result).toEqual(true);
    });

    it('should return true for a customer in a not-collecting location', async () => {
      const mockCustomer = StripeCustomerFactory({
        tax: {
          automatic_tax: 'not_collecting',
          ip_address: null,
          location: null,
        },
      });

      const result = await manager.isCustomerStripeTaxEligible(mockCustomer);
      expect(result).toEqual(true);
    });
  });

  describe('getCustomerTaxId', () => {
    it('returns customer tax id if found', async () => {
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: [{ name: 'Tax ID', value: 'LeeroyJenkins' }],
          default_payment_method: null,
          footer: null,
          rendering_options: null,
        },
      });

      mockClient.customersRetrieve = jest
        .fn()
        .mockResolvedValueOnce(mockCustomer);

      const result = await manager.getCustomerTaxId(mockCustomer.id);

      expect(result).toEqual('LeeroyJenkins');
    });

    it('returns undefined when customer tax id not found', async () => {
      const mockCustomer = StripeCustomerFactory();

      mockClient.customersRetrieve = jest
        .fn()
        .mockResolvedValueOnce(mockCustomer);

      const result = await manager.getCustomerTaxId(mockCustomer.id);

      expect(result).toBeUndefined();
    });
  });

  describe('setCustomerTaxId', () => {
    it('updates customer object with incoming tax id when match is not found', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockUpdatedCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: [{ name: 'Tax ID', value: 'EU1234' }],
          default_payment_method: null,
          footer: null,
          rendering_options: null,
        },
      });

      mockClient.customersRetrieve = jest
        .fn()
        .mockResolvedValueOnce(mockCustomer);

      mockClient.customersUpdate = jest
        .fn()
        .mockResolvedValueOnce(mockUpdatedCustomer);

      const result = await manager.setCustomerTaxId(mockCustomer.id, 'EU1234');

      expect(result).toEqual(mockUpdatedCustomer);
    });

    it('does not update customer object when incoming tax id matches existing tax id', async () => {
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: [{ name: 'Tax ID', value: 'T43CAK315A713' }],
          default_payment_method: null,
          footer: null,
          rendering_options: null,
        },
      });

      mockClient.customersRetrieve = jest
        .fn()
        .mockResolvedValueOnce(mockCustomer);

      const result = await manager.setCustomerTaxId(
        mockCustomer.id,
        'T43CAK315A713'
      );

      expect(result).toBeUndefined();
    });
  });

  describe('getPlan', () => {
    it('returns plan', async () => {
      const mockPlan = StripePlanFactory();

      mockClient.plansRetrieve = jest.fn().mockResolvedValueOnce([mockPlan]);

      const result = await manager.getPlan(mockPlan.id);
      expect(result).toEqual([mockPlan]);
    });

    it('should throw error if no plan exists', async () => {
      const mockPlan = StripePlanFactory();
      mockClient.plansRetrieve = jest.fn().mockResolvedValueOnce(undefined);

      expect(manager.getPlan(mockPlan.id)).rejects.toBeInstanceOf(
        PlanNotFoundError
      );
    });
  });

  describe('getPlanByInterval', () => {
    it('returns plan that matches interval', async () => {
      const mockPlan = StripePlanFactory();
      const mockInterval = mockPlan.interval;

      manager.getPlan = jest.fn().mockResolvedValueOnce(mockPlan);

      const result = await manager.getPlanByInterval(
        [mockPlan.id],
        mockInterval
      );
      expect(result).toEqual(mockPlan);
    });

    it('throw error if interval returns multiple plans', async () => {
      const mockPlan1 = StripePlanFactory({
        interval: 'month',
      });
      const mockPlan2 = StripePlanFactory({
        interval: 'month',
      });

      expect(
        manager.getPlanByInterval([mockPlan1.id, mockPlan2.id], 'month')
      ).rejects.toBeInstanceOf(PlanIntervalMultiplePlansError);
    });
  });
});
