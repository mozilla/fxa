/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { StripeClient } from './stripe.client';
import { StripeCustomer } from './stripe.client.types';
import { StripeConfig } from './stripe.config';
import {
  MOZILLA_TAX_ID,
  STRIPE_MINIMUM_CHARGE_AMOUNTS,
} from './stripe.constants';
import {
  CustomerDeletedError,
  CustomerNotFoundError,
  StripeNoMinimumChargeAmountAvailableError,
} from './stripe.error';

@Injectable()
export class StripeManager {
  private taxIds: { [key: string]: string };
  constructor(private client: StripeClient, private config: StripeConfig) {
    this.taxIds = this.config.taxIds;
  }

  /**
   * Returns minimum amount for valid currency
   * Throws error for invalid currency
   */
  getMinimumAmount(currency: string): number {
    if (STRIPE_MINIMUM_CHARGE_AMOUNTS[currency]) {
      return STRIPE_MINIMUM_CHARGE_AMOUNTS[currency];
    }

    throw new StripeNoMinimumChargeAmountAvailableError();
  }

  /**
   * Returns the correct tax id for currency
   */
  getTaxIdForCurrency(currency: string) {
    return this.taxIds[currency.toUpperCase()];
  }

  /**
   * Retrieves a customer record
   */
  async fetchActiveCustomer(customerId: string) {
    const customer = await this.client.customersRetrieve(customerId);
    if (customer.deleted) throw new CustomerDeletedError();
    return customer;
  }

  /**
   * Finalizes an invoice and marks auto_advance as false.
   */
  async finalizeInvoiceWithoutAutoAdvance(invoiceId: string) {
    return this.client.invoicesFinalizeInvoice(invoiceId, {
      auto_advance: false,
    });
  }

  /**
   * Cancels incomplete subscription
   */
  async cancelIncompleteSubscriptionsToPrice(
    customerId: string,
    priceId: string
  ) {
    const subscriptions = await this.getSubscriptions(customerId);
    const targetSubs = subscriptions.data.filter((sub) =>
      sub.items.data.find((item) => item.price.id === priceId)
    );

    for (const sub of targetSubs) {
      if (sub && sub.status === 'incomplete') {
        await this.client.subscriptionsCancel(sub.id);
      }
    }
  }

  /**
   * Retrieves subscriptions
   */
  async getSubscriptions(customerId: string) {
    return this.client.subscriptionsList({
      customer: customerId,
    });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.client.subscriptionsCancel(subscriptionId);
  }

  /**
   * Check if customer's automatic tax status indicates that they're eligible for automatic tax.
   * Creating a subscription with automatic_tax enabled requires a customer with an address
   * that is in a recognized location with an active tax registration.
   */
  async isCustomerStripeTaxEligible(customer: StripeCustomer) {
    return (
      customer.tax.automatic_tax === 'supported' ||
      customer.tax.automatic_tax === 'not_collecting'
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
      return await this.client.customersUpdate(customerId, {
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
    const customer = await this.client.customersRetrieve(customerId);

    if (!customer) throw new CustomerNotFoundError();
    if (customer.deleted) throw new CustomerDeletedError();

    const customFields = customer.invoice_settings.custom_fields || [];

    const taxIdFields = customFields.filter((customField: any) => {
      return customField.name === MOZILLA_TAX_ID;
    });

    return taxIdFields.at(0)?.value;
  }
}
