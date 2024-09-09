/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  StripeClient,
  StripeResponseFactory,
  StripeCustomerFactory,
  StripeInvoiceFactory,
  StripePriceFactory,
  StripeUpcomingInvoiceFactory,
  MockStripeConfigProvider,
} from '@fxa/payments/stripe';
import { TaxAddressFactory } from './factories/tax-address.factory';
import { InvoicePreviewFactory } from './invoice.factories';
import { InvoiceManager } from './invoice.manager';
import { stripeInvoiceToFirstInvoicePreviewDTO } from '../lib/util/stripeInvoiceToFirstInvoicePreviewDTO';
import { getMinimumChargeAmountForCurrency } from '../lib/util/getMinimumChargeAmountForCurrency';

jest.mock('../lib/util/stripeInvoiceToFirstInvoicePreviewDTO');
const mockedStripeInvoiceToFirstInvoicePreviewDTO = jest.mocked(
  stripeInvoiceToFirstInvoicePreviewDTO
);

jest.mock('../lib/util/getMinimumChargeAmountForCurrency');
const mockedGetMinimumChargeAmountForCurrency = jest.mocked(
  getMinimumChargeAmountForCurrency
);

describe('InvoiceManager', () => {
  let invoiceManager: InvoiceManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [StripeClient, MockStripeConfigProvider, InvoiceManager],
    }).compile();

    invoiceManager = module.get(InvoiceManager);
    stripeClient = module.get(StripeClient);
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

      mockedStripeInvoiceToFirstInvoicePreviewDTO.mockReturnValue(
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

      mockedGetMinimumChargeAmountForCurrency.mockReturnValue(10);
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

      mockedGetMinimumChargeAmountForCurrency.mockReturnValue(10);
      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(mockCustomer);
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
