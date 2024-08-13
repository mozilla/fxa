/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { CustomerManager } from './customer.manager';
import { StripeResponseFactory } from './factories/api-list.factory';
import { StripeCustomerFactory } from './factories/customer.factory';
import { StripeInvoiceFactory } from './factories/invoice.factory';
import { StripePriceFactory } from './factories/price.factory';
import { StripeUpcomingInvoiceFactory } from './factories/upcoming-invoice.factory';
import { TaxAddressFactory } from './factories/tax-address.factory';
import { StripeClient } from './stripe.client';
import { MockStripeConfigProvider } from './stripe.config';
import { InvoicePreviewFactory } from './stripe.factories';
import { InvoiceManager } from './invoice.manager';
import { SubscriptionManager } from './subscription.manager';
import * as StripeUtil from '../lib/util/stripeInvoiceToFirstInvoicePreviewDTO';

jest.mock('../lib/util/stripeInvoiceToFirstInvoicePreviewDTO');

const mockStripeUtil = jest.mocked(StripeUtil);

describe('InvoiceManager', () => {
  let customerManager: CustomerManager;
  let invoiceManager: InvoiceManager;
  let stripeClient: StripeClient;
  let subscriptionManager: SubscriptionManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CustomerManager,
        InvoiceManager,
        StripeClient,
        SubscriptionManager,
        MockStripeConfigProvider,
      ],
    }).compile();

    customerManager = module.get(CustomerManager);
    invoiceManager = module.get(InvoiceManager);
    stripeClient = module.get(StripeClient);
    subscriptionManager = module.get(SubscriptionManager);
  });

  describe('finalizeWithoutAutoAdvance', () => {
    it('works successfully', async () => {
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          auto_advance: false,
        })
      );

      jest
        .spyOn(stripeClient, 'invoicesFinalizeInvoice')
        .mockResolvedValue(mockInvoice);

      const result = await invoiceManager.finalizeWithoutAutoAdvance(
        mockInvoice.id
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('preview', () => {
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

      const result = await invoiceManager.preview({
        priceId: mockPrice.id,
        customer: mockCustomer,
        taxAddress: mockTaxAddress,
      });
      expect(result).toEqual(mockInvoicePreview);
    });
  });

  describe('retrieve', () => {
    it('retrieves an invoice', async () => {
      const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());
      const mockResponse = StripeResponseFactory(mockInvoice);

      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await invoiceManager.retrieve(mockInvoice.id);

      expect(stripeClient.invoicesRetrieve).toBeCalledWith(mockInvoice.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('processInvoice', () => {
    it('calls processZeroInvoice when amount is less than minimum amount', async () => {
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          amount_due: 0,
          currency: 'usd',
        })
      );

      jest.spyOn(subscriptionManager, 'getMinimumAmount').mockReturnValue(10);
      jest
        .spyOn(invoiceManager, 'processPayPalZeroInvoice')
        .mockResolvedValue(mockInvoice);
      jest
        .spyOn(invoiceManager, 'processPayPalNonZeroInvoice')
        .mockResolvedValue();

      await invoiceManager.processPayPalInvoice(mockInvoice);
      expect(invoiceManager.processPayPalZeroInvoice).toBeCalledWith(
        mockInvoice.id
      );
      expect(invoiceManager.processPayPalNonZeroInvoice).not.toHaveBeenCalled();
    });

    it('calls InvoiceManager processNonZeroInvoice when amount is greater than minimum amount', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockInvoice = StripeInvoiceFactory({
        amount_due: 50,
        currency: 'usd',
      });

      jest.spyOn(subscriptionManager, 'getMinimumAmount').mockReturnValue(10);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'processPayPalZeroInvoice')
        .mockResolvedValue(StripeResponseFactory(mockInvoice));
      jest
        .spyOn(invoiceManager, 'processPayPalNonZeroInvoice')
        .mockResolvedValue();

      await invoiceManager.processPayPalInvoice(mockInvoice);

      expect(invoiceManager.processPayPalNonZeroInvoice).toBeCalledWith(
        mockCustomer,
        mockInvoice
      );
      expect(invoiceManager.processPayPalZeroInvoice).not.toHaveBeenCalled();
    });
  });

  describe('processZeroInvoice', () => {
    it('finalizes invoices with no amount set to zero', async () => {
      const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());

      jest
        .spyOn(invoiceManager, 'finalizeWithoutAutoAdvance')
        .mockResolvedValue(mockInvoice);

      const result = await invoiceManager.processPayPalZeroInvoice(
        mockInvoice.id
      );

      expect(result).toEqual(mockInvoice);
      expect(invoiceManager.finalizeWithoutAutoAdvance).toBeCalledWith(
        mockInvoice.id
      );
    });
  });
});
