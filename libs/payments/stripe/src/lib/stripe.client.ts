/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { StripeClientConfig } from './stripe.client.config';

@Injectable()
export class StripeClient {
  public readonly stripe: Stripe;

  constructor(private stripeClientConfig: StripeClientConfig) {
    this.stripe = new Stripe(this.stripeClientConfig.apiKey, {
      apiVersion: '2022-11-15',
      maxNetworkRetries: 3,
    });
  }

  /**
   * Retrieves a customer record directly from Stripe
   */
  async fetchCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId);
  }

  /**
   * Updates customer object with the values of the parameters passed
   *
   * @param customerId The Stripe customer ID of the customer to update
   * @param params Values to be updated in customer object
   * @returns The updated customer object or throws an error if paramaters are invalid
   */
  async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams
  ) {
    return this.stripe.customers.update(customerId, params);
  }

  /**
   * Retrieves subscriptions directly from Stripe
   */
  async fetchSubscriptions(customerId: string) {
    return this.stripe.subscriptions.list({
      customer: customerId,
    });
  }

  async finalizeInvoice(
    invoiceId: string,
    params?: Stripe.InvoiceFinalizeInvoiceParams | undefined
  ) {
    return this.stripe.invoices.finalizeInvoice(invoiceId, params);
  }
}
