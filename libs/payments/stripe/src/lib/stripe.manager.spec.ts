/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockStripeUtil = {
  stripeInvoiceToFirstInvoicePreviewDTO: jest.fn(),
};

jest.mock(
  '../../../stripe/src/lib/util/stripeInvoiceToFirstInvoicePreviewDTO',
  () => mockStripeUtil
);

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import {
  StripeApiListFactory,
  StripeResponseFactory,
} from './factories/api-list.factory';
import { StripeCustomerFactory } from './factories/customer.factory';
import { StripeInvoiceFactory } from './factories/invoice.factory';
import { StripePaymentIntentFactory } from './factories/payment-intent.factory';
import { StripePlanFactory } from './factories/plan.factory';
import { StripePriceFactory } from './factories/price.factory';
import { StripeProductFactory } from './factories/product.factory';
import { StripePromotionCodeFactory } from './factories/promotion-code.factory';
import { StripeSubscriptionFactory } from './factories/subscription.factory';
import { StripeUpcomingInvoiceFactory } from './factories/upcoming-invoice.factory';
import { TaxAddressFactory } from './factories/tax-address.factory';
import { StripeClient } from './stripe.client';
import { MockStripeConfigProvider } from './stripe.config';
import { PlanIntervalMultiplePlansError } from './stripe.error';
import { InvoicePreviewFactory } from './stripe.factories';
import { StripeManager } from './stripe.manager';
import { SubplatInterval } from './stripe.types';

describe('StripeManager', () => {
  let stripeManager: StripeManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockStripeConfigProvider, StripeClient, StripeManager],
    }).compile();

    stripeManager = module.get(StripeManager);
    stripeClient = module.get(StripeClient);
  });

  describe('fetchActiveCustomer', () => {
    it('returns an existing customer from Stripe', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValueOnce(mockCustomer);

      const result = await stripeManager.fetchActiveCustomer(mockCustomer.id);
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('finalizeInvoiceWithoutAutoAdvance', () => {
    it('works successfully', async () => {
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          auto_advance: false,
        })
      );

      jest
        .spyOn(stripeClient, 'invoicesFinalizeInvoice')
        .mockResolvedValue(mockInvoice);

      const result = await stripeManager.finalizeInvoiceWithoutAutoAdvance(
        mockInvoice.id
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('previewInvoice', () => {
    it('returns upcoming invoice', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockUpcomingInvoice = StripeResponseFactory(
        StripeUpcomingInvoiceFactory()
      );

      const mockTaxAddress = TaxAddressFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest
        .spyOn(stripeClient, 'invoicesRetrieveUpcoming')
        .mockResolvedValue(mockUpcomingInvoice);

      mockStripeUtil.stripeInvoiceToFirstInvoicePreviewDTO.mockReturnValue(
        mockInvoicePreview
      );

      const result = await stripeManager.previewInvoice({
        priceId: mockPrice.id,
        customer: mockCustomer,
        taxAddress: mockTaxAddress,
      });
      expect(result).toEqual(mockInvoicePreview);
    });
  });

  describe('getMinimumAmount', () => {
    it('returns minimum amout for valid currency', () => {
      const expected = 50;
      const result = stripeManager.getMinimumAmount('usd');

      expect(result).toEqual(expected);
    });

    it('should throw an error if currency is invalid', () => {
      expect(() => stripeManager.getMinimumAmount('fake')).toThrow(
        'Currency does not have a minimum charge amount available.'
      );
    });
  });

  describe('getTaxIdForCurrency', () => {
    it('returns the correct tax id for currency', async () => {
      const mockCurrency = 'eur';

      const result = stripeManager.getTaxIdForCurrency(mockCurrency);
      expect(result).toEqual('EU1234');
    });

    it('returns empty string when no  tax id found', async () => {
      const mockCurrency = faker.finance.currencyCode();

      const result = stripeManager.getTaxIdForCurrency(mockCurrency);
      expect(result).toEqual(undefined);
    });
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
        .spyOn(stripeManager, 'getSubscriptions')
        .mockResolvedValue(mockSubscriptionList);

      jest
        .spyOn(stripeClient, 'subscriptionsCancel')
        .mockResolvedValue(mockResponse);

      await stripeManager.cancelIncompleteSubscriptionsToPrice(
        mockCustomer.id,
        mockPrice.id
      );

      expect(stripeClient.subscriptionsCancel).toBeCalledWith(
        mockSubscription.id
      );
    });
  });

  describe('getSubscriptions', () => {
    it('returns subscriptions', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockSubscriptionList = StripeApiListFactory([mockSubscription]);
      const mockCustomer = StripeCustomerFactory();

      const expected = mockSubscriptionList.data;

      jest
        .spyOn(stripeClient, 'subscriptionsList')
        .mockResolvedValue(mockSubscriptionList);

      const result = await stripeManager.getSubscriptions(mockCustomer.id);
      expect(result).toEqual(expected);
    });

    it('returns empty array if no subscriptions exist', async () => {
      const mockCustomer = StripeCustomerFactory();

      jest
        .spyOn(stripeClient, 'subscriptionsList')
        .mockResolvedValue(StripeApiListFactory([]));

      const result = await stripeManager.getSubscriptions(mockCustomer.id);
      expect(result).toEqual([]);
    });
  });

  describe('cancelSubscription', () => {
    it('calls stripeclient', async () => {
      const mockSubscription = StripeSubscriptionFactory();

      jest
        .spyOn(stripeClient, 'subscriptionsCancel')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));

      await stripeManager.cancelSubscription(mockSubscription.id);

      expect(stripeClient.subscriptionsCancel).toBeCalledWith(
        mockSubscription.id
      );
    });
  });

  describe('retrieveSubscription', () => {
    it('calls stripeclient', async () => {
      const mockSubscription = StripeSubscriptionFactory();
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await stripeManager.retrieveSubscription(
        mockSubscription.id
      );

      expect(stripeClient.subscriptionsRetrieve).toBeCalledWith(
        mockSubscription.id
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateSubscription', () => {
    it('calls stripeclient', async () => {
      const mockParams = {
        description: 'This is an updated subscription',
      };
      const mockSubscription = StripeSubscriptionFactory(mockParams);
      const mockResponse = StripeResponseFactory(mockSubscription);

      jest
        .spyOn(stripeClient, 'subscriptionsUpdate')
        .mockResolvedValue(mockResponse);

      const result = await stripeManager.updateSubscription(
        mockSubscription.id,
        mockParams
      );

      expect(stripeClient.subscriptionsUpdate).toBeCalledWith(
        mockSubscription.id,
        mockParams
      );
      expect(result).toEqual(mockResponse);
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

      const result = stripeManager.isCustomerStripeTaxEligible(mockCustomer);
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

      const result = stripeManager.isCustomerStripeTaxEligible(mockCustomer);
      expect(result).toEqual(true);
    });
  });

  describe('getPromotionCodeByName', () => {
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

      const result = await stripeManager.getPromotionCodeByName(
        mockPromotionCode.code
      );
      expect(result).toEqual(mockPromotionCode);
    });
  });

  describe('retrievePromotionCode', () => {
    it('retrieves promotion code', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockResponse = StripeResponseFactory(mockPromotionCode);

      jest
        .spyOn(stripeClient, 'promotionCodesRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await stripeManager.retrievePromotionCode(
        mockPromotionCode.id
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCustomerTaxId', () => {
    it('returns customer tax id if found', async () => {
      const mockTaxIdValue = faker.string.uuid();
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: [{ name: 'Tax ID', value: mockTaxIdValue }],
          default_payment_method: null,
          footer: null,
          rendering_options: null,
        },
      });

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockCustomer));

      const result = await stripeManager.getCustomerTaxId(mockCustomer.id);

      expect(result).toEqual(mockTaxIdValue);
    });

    it('returns undefined when customer tax id not found', async () => {
      const mockCustomer = StripeCustomerFactory();

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockCustomer));

      const result = await stripeManager.getCustomerTaxId(mockCustomer.id);

      expect(result).toBeUndefined();
    });
  });

  describe('setCustomerTaxId', () => {
    it('updates customer object with incoming tax id when match is not found', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockUpdatedCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          invoice_settings: {
            custom_fields: [{ name: 'Tax ID', value: 'EU1234' }],
            default_payment_method: null,
            footer: null,
            rendering_options: null,
          },
        })
      );

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(mockCustomer);

      jest
        .spyOn(stripeClient, 'customersUpdate')
        .mockResolvedValue(mockUpdatedCustomer);

      const result = await stripeManager.setCustomerTaxId(
        mockCustomer.id,
        'EU1234'
      );

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

      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(StripeResponseFactory(mockCustomer));

      const result = await stripeManager.setCustomerTaxId(
        mockCustomer.id,
        'T43CAK315A713'
      );

      expect(result).toBeUndefined();
    });
  });

  describe('getPlan', () => {
    it('returns plan', async () => {
      const mockPlan = StripeResponseFactory(StripePlanFactory());

      jest.spyOn(stripeClient, 'plansRetrieve').mockResolvedValue(mockPlan);

      const result = await stripeManager.getPlan(mockPlan.id);
      expect(result).toEqual(mockPlan);
    });
  });

  describe('getPlanByInterval', () => {
    it('returns plan that matches interval', async () => {
      const mockPlan = StripeResponseFactory(
        StripePlanFactory({
          interval: 'month',
          interval_count: 1,
        })
      );
      const subplatInterval = SubplatInterval.Monthly;

      jest.spyOn(stripeManager, 'getPlan').mockResolvedValue(mockPlan);

      const result = await stripeManager.getPlanByInterval(
        [mockPlan.id],
        subplatInterval
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
      const subplatInterval = SubplatInterval.Monthly;

      jest
        .spyOn(stripeManager, 'getPlan')
        .mockResolvedValue(StripeResponseFactory(mockPlan1));
      jest
        .spyOn(stripeManager, 'getPlan')
        .mockResolvedValue(StripeResponseFactory(mockPlan2));

      await expect(
        stripeManager.getPlanByInterval(
          [mockPlan1.id, mockPlan2.id],
          subplatInterval
        )
      ).rejects.toBeInstanceOf(PlanIntervalMultiplePlansError);
    });
  });

  describe('retrieveProduct', () => {
    it('returns product', async () => {
      const mockProduct = StripeResponseFactory(StripeProductFactory());

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(mockProduct);

      const result = await stripeManager.retrieveProduct(mockProduct.id);
      expect(result).toEqual(mockProduct);
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

      const result = await stripeManager.getLatestPaymentIntent(
        mockSubscription
      );

      expect(result).toEqual(mockPaymentIntent);
    });

    it('returns undefined if no invoice on subscription', async () => {
      const mockSubscription = StripeSubscriptionFactory({
        latest_invoice: null,
      });

      const result = await stripeManager.getLatestPaymentIntent(
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

      const result = await stripeManager.getLatestPaymentIntent(
        mockSubscription
      );

      expect(result).toEqual(undefined);
    });
  });
});
