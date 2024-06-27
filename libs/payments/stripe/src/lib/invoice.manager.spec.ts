/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

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
import * as StripeUtil from '../lib/util/stripeInvoiceToFirstInvoicePreviewDTO';

jest.mock('../lib/util/stripeInvoiceToFirstInvoicePreviewDTO');

const mockStripeUtil = jest.mocked(StripeUtil);

describe('InvoiceManager', () => {
  let invoiceManager: InvoiceManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockStripeConfigProvider, StripeClient, InvoiceManager],
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
});
