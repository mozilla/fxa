/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { StripeClient } from './stripe.client';
import { StripeCustomer, StripeInvoice } from './stripe.client.types';
import { TaxAddress } from './stripe.types';
import { isCustomerTaxEligible } from './util/isCustomerTaxEligible';
import { stripeInvoiceToFirstInvoicePreviewDTO } from './util/stripeInvoiceToFirstInvoicePreviewDTO';
import { getMinimumChargeAmountForCurrency } from './util/getMinimumChargeAmountForCurrency';

@Injectable()
export class InvoiceManager {
  constructor(private stripeClient: StripeClient) {}

  async finalizeWithoutAutoAdvance(invoiceId: string) {
    return this.stripeClient.invoicesFinalizeInvoice(invoiceId, {
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

    const upcomingInvoice = await this.stripeClient.invoicesRetrieveUpcoming(
      requestObject
    );

    return stripeInvoiceToFirstInvoicePreviewDTO(upcomingInvoice);
  }

  /**
   * Retrieves an invoice
   */
  async retrieve(invoiceId: string) {
    return this.stripeClient.invoicesRetrieve(invoiceId);
  }

  /**
   * Process an invoice when amount is greater than minimum amount
   */
  async processPayPalNonZeroInvoice(
    customer: StripeCustomer,
    invoice: StripeInvoice,
    ipaddress?: string
  ) {
    // TODO in M3b: Implement legacy processInvoice as processNonZeroInvoice here
    // TODO: Add spec
    console.log(customer, invoice, ipaddress);
  }

  /**
   * Finalize and process a draft invoice that has no amounted owed.
   */
  async processPayPalZeroInvoice(invoiceId: string) {
    // It appears for subscriptions that do not require payment, the invoice
    // transitions to paid automatially.
    // https://stripe.com/docs/billing/invoices/subscription#sub-invoice-lifecycle
    return this.finalizeWithoutAutoAdvance(invoiceId);
  }

  /**
   * Process an invoice
   * If amount is less than minimum amount, call processZeroInvoice
   * If amount is greater than minimum amount, call processNonZeroInvoice (legacy PaypalHelper processInvoice)
   */
  async processPayPalInvoice(invoice: StripeInvoice) {
    if (!invoice.customer) throw new Error('Customer not present on invoice');
    const amountInCents = invoice.amount_due;

    if (amountInCents < getMinimumChargeAmountForCurrency(invoice.currency)) {
      await this.processPayPalZeroInvoice(invoice.id);
      return;
    }

    const customer = await this.stripeClient.customersRetrieve(
      invoice.customer
    );
    if (customer.deleted)
      throw new Error('Processing paypal invoice on deleted customer');

    await this.processPayPalNonZeroInvoice(customer, invoice);
  }
}
