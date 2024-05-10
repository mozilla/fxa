/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { StripeClient } from './stripe.client';
import {
  StripeCustomer,
  StripePlan,
  StripeSubscription,
} from './stripe.client.types';
import { StripeConfig } from './stripe.config';
import {
  MOZILLA_TAX_ID,
  STRIPE_MINIMUM_CHARGE_AMOUNTS,
} from './stripe.constants';
import {
  CustomerDeletedError,
  CustomerNotFoundError,
  PlanIntervalMultiplePlansError,
  PlanNotFoundError,
  ProductNotFoundError,
  StripeNoMinimumChargeAmountAvailableError,
} from './stripe.error';
import { SubplatInterval, TaxAddress } from './stripe.types';
import { doesPlanMatchSubplatInterval } from './util/doesPlanMatchSubplatInterval';
import { stripeInvoiceToFirstInvoicePreviewDTO } from './util/stripeInvoiceToFirstInvoicePreviewDTO';

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
   * Updates a customer record
   */
  async updateCustomer(
    customerId: string,
    params?: Stripe.CustomerUpdateParams
  ) {
    return await this.client.customersUpdate(customerId, params);
  }

  /**
   * Create customer stub account
   */
  async createPlainCustomer(args: { email?: string; taxAddress?: TaxAddress }) {
    if (args.taxAddress) {
      return this.client.customersCreate({
        shipping: {
          name: args.email || '',
          address: {
            country: args.taxAddress.countryCode,
            postal_code: args.taxAddress.postalCode,
          },
        },
      });
    }

    return this.client.customersCreate();
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
   * Returns upcoming invoice
   */
  async previewInvoice({
    priceId,
    customer,
    taxAddress,
  }: {
    priceId: string;
    customer?: StripeCustomer;
    taxAddress?: TaxAddress;
  }) {
    const automaticTax = !!(
      (customer && this.isCustomerStripeTaxEligible(customer)) ||
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

  /**
   * Cancels incomplete subscription
   */
  async cancelIncompleteSubscriptionsToPrice(
    customerId: string,
    priceId: string
  ) {
    const subscriptions = await this.getSubscriptions(customerId);
    const targetSubs = subscriptions.filter((sub) =>
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
    const result = await this.client.subscriptionsList({
      customer: customerId,
    });

    return result.data;
  }

  async cancelSubscription(subscriptionId: string) {
    return this.client.subscriptionsCancel(subscriptionId);
  }

  async retrieveSubscription(subscriptionId: string) {
    return this.client.subscriptionsRetrieve(subscriptionId);
  }

  async updateSubscription(
    subscriptionId: string,
    params?: Stripe.SubscriptionUpdateParams
  ) {
    return this.client.subscriptionsUpdate(subscriptionId, params);
  }

  /**
   * Check if customer's automatic tax status indicates that they're eligible for automatic tax.
   * Creating a subscription with automatic_tax enabled requires a customer with an address
   * that is in a recognized location with an active tax registration.
   */
  isCustomerStripeTaxEligible(customer: StripeCustomer) {
    return (
      customer.tax.automatic_tax === 'supported' ||
      customer.tax.automatic_tax === 'not_collecting'
    );
  }

  async getPromotionCodeByName(code: string, active?: boolean) {
    const promotionCodes = await this.client.promotionCodesList({
      active,
      code,
    });

    return promotionCodes.data.at(0);
  }

  async retrievePromotionCode(id: string) {
    return this.client.promotionCodesRetrieve(id);
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

  async getPlan(planId: string) {
    const plan = await this.client.plansRetrieve(planId);
    if (!plan) throw new PlanNotFoundError();
    return plan;
  }

  async getPlanByInterval(planIds: string[], interval: SubplatInterval) {
    const plans: StripePlan[] = [];
    for (const planId of planIds) {
      const plan = await this.getPlan(planId);
      if (doesPlanMatchSubplatInterval(plan, interval)) {
        plans.push(plan);
      }
    }
    if (plans.length > 1) throw new PlanIntervalMultiplePlansError();
    return plans.at(0);
  }

  async retrieveProduct(productId: string) {
    const product = await this.client.productsRetrieve(productId);
    if (!product) throw new ProductNotFoundError();
    return product;
  }

  async getLatestPaymentIntent(subscription: StripeSubscription) {
    if (!subscription.latest_invoice) {
      return;
    }
    const latestInvoice = await this.client.invoicesRetrieve(
      subscription.latest_invoice
    );

    if (!latestInvoice.payment_intent) {
      return;
    }

    const paymentIntent = await this.client.paymentIntentRetrieve(
      latestInvoice.payment_intent
    );

    return paymentIntent;
  }
}
