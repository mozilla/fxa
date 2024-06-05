/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { StripeClient } from './stripe.client';
import { StripeCustomer } from './stripe.client.types';
import { TaxAddress } from './stripe.types';
import { stripeInvoiceToFirstInvoicePreviewDTO } from './util/stripeInvoiceToFirstInvoicePreviewDTO';
import { isCustomerTaxEligible } from './util/isCustomerTaxEligible';

@Injectable()
export class InvoiceManager {
  constructor(private client: StripeClient) {}

  async finalizeWithoutAutoAdvance(invoiceId: string) {
    return this.client.invoicesFinalizeInvoice(invoiceId, {
      auto_advance: false,
    });
  }

  async preview({
    priceId,
    customer,
    taxAddress,
  }: {
    priceId: string;
    customer?: StripeCustomer;
    taxAddress?: TaxAddress;
  }) {
    const automaticTax = !!(
      (customer && isCustomerTaxEligible(customer)) ||
      (!customer && taxAddress)
    );

    const shipping =
      !customer && taxAddress
        ? {
            name: '',
            address: {
              country: taxAddress.countryCode,
              postal_code: taxAddress.postalCode,
            },
          }
        : undefined;

    const requestObject: Stripe.InvoiceRetrieveUpcomingParams = {
      customer: customer?.id,
      automatic_tax: {
        enabled: automaticTax,
      },
      customer_details: {
        tax_exempt: 'none', // Param required when shipping address not present
        shipping,
      },
      subscription_items: [{ price: priceId }],
    };

    const upcomingInvoice = await this.client.invoicesRetrieveUpcoming(
      requestObject
    );

    return stripeInvoiceToFirstInvoicePreviewDTO(upcomingInvoice);
  }
}
