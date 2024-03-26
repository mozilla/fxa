/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { StripeClient } from './stripe.client';
import {
  STRIPE_MINIMUM_CHARGE_AMOUNTS,
  MOZILLA_TAX_ID,
} from './stripe.constants';
import {
  CustomerDeletedError,
  CustomerNotFoundError,
  SubscriptionStripeError,
} from './stripe.error';

@Injectable()
export class StripeManager {
  constructor(private client: StripeClient) {}

  /**
   * Retrieves a customer record
   *
   * @param customerId
   * @returns
   */
  async fetchActiveCustomer(customerId: string) {
    const customer = await this.client.fetchCustomer(customerId);
    if (customer.deleted) throw new CustomerDeletedError();
    return customer;
  }

  /**
   * Finalizes an invoice and marks auto_advance as false.
   */
  async finalizeInvoiceWithoutAutoAdvance(invoiceId: string) {
    return this.client.finalizeInvoice(invoiceId, {
      auto_advance: false,
    });
  }

  /**
   * Returns minimum amount for valid currency
   * Throws error for invalid currency
   *
   * @param currency
   * @returns
   */
  getMinimumAmount(currency: string): number {
    if (STRIPE_MINIMUM_CHARGE_AMOUNTS[currency]) {
      return STRIPE_MINIMUM_CHARGE_AMOUNTS[currency];
    }

    throw new SubscriptionStripeError();
  }

  /**
   * Retrieves subscriptions
   *
   * @param customerId
   */
  async getSubscriptions(customerId: string) {
    return this.client.fetchSubscriptions(customerId);
  }

  /**
   * Check if customer's automatic tax status indicates that they're eligible for automatic tax.
   * Creating a subscription with automatic_tax enabled requires a customer with an address
   * that is in a recognized location with an active tax registration.
   */
  async isCustomerStripeTaxEligible(customer: Stripe.Customer) {
    if (!customer.tax) {
      // TODO: FXA-8891
      throw new Error('customer.tax is not present');
    }

    return (
      customer.tax?.automatic_tax === 'supported' ||
      customer.tax?.automatic_tax === 'not_collecting'
    );
  }

  /**
   * Updates customer object with incoming tax ID if existing tax ID does not match
   *
   * @param customerId Customer ID of customer to be updated
   * @param taxId Customer tax ID to be updated if different from existing tax ID
   * @returns True if the customer was updated, false otherwise
   */
  async setCustomerTaxId(customerId: string, taxId: string) {
    const customerTaxId = await this.getCustomerTaxId(customerId);

    if (!customerTaxId || customerTaxId !== taxId) {
      return await this.client.updateCustomer(customerId, {
        invoice_settings: {
          custom_fields: [{ name: MOZILLA_TAX_ID, value: taxId }],
        },
      });
    }

    return;
  }

  /**
   * Returns tax ID of customer
   *
   * @param customerId ID of customer to fetch and check existing tax ID
   * @returns The tax ID of customer or undefined if not found
   */
  async getCustomerTaxId(customerId: string) {
    const customer = await this.client.fetchCustomer(customerId);

    if (!customer) throw new CustomerNotFoundError();
    if (customer.deleted) throw new CustomerDeletedError();

    const customFields = customer.invoice_settings.custom_fields || [];

    const taxIdFields = customFields.filter((customField: any) => {
      return customField.name === MOZILLA_TAX_ID;
    });

    return taxIdFields.at(0)?.value;
  }
}
