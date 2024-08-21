/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { StripeClient } from './stripe.client';
import { StripeSubscription } from './stripe.client.types';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  STRIPE_MINIMUM_CHARGE_AMOUNTS,
} from './stripe.constants';
import { StripeNoMinimumChargeAmountAvailableError } from './stripe.error';

@Injectable()
export class SubscriptionManager {
  constructor(private client: StripeClient) {}

  async cancel(subscriptionId: string) {
    return this.client.subscriptionsCancel(subscriptionId);
  }

  async create(
    params: Stripe.SubscriptionCreateParams,
    options?: Stripe.RequestOptions
  ) {
    return this.client.subscriptionsCreate(params, options);
  }

  async retrieve(subscriptionId: string) {
    return this.client.subscriptionsRetrieve(subscriptionId);
  }

  async update(
    subscriptionId: string,
    params?: Stripe.SubscriptionUpdateParams
  ) {
    return this.client.subscriptionsUpdate(subscriptionId, params);
  }

  async listForCustomer(customerId: string) {
    const result = await this.client.subscriptionsList({
      customer: customerId,
    });

    return result.data;
  }

  /**
   * Returns minimum charge amount for currency
   * Throws error for invalid currency
   */
  getMinimumAmount(currency: string): number {
    if (STRIPE_MINIMUM_CHARGE_AMOUNTS[currency]) {
      return STRIPE_MINIMUM_CHARGE_AMOUNTS[currency];
    }

    throw new StripeNoMinimumChargeAmountAvailableError();
  }

  async cancelIncompleteSubscriptionsToPrice(
    customerId: string,
    priceId: string
  ) {
    const subscriptions = await this.listForCustomer(customerId);
    const targetSubs = subscriptions.filter((sub) =>
      sub.items.data.find((item) => item.price.id === priceId)
    );

    for (const sub of targetSubs) {
      if (sub && sub.status === 'incomplete') {
        await this.client.subscriptionsCancel(sub.id);
      }
    }
  }

  async getCustomerPayPalSubscriptions(customerId: string) {
    const subscriptions = await this.listForCustomer(customerId);
    if (!subscriptions) return [];
    return subscriptions.filter(
      (sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status) &&
        sub.collection_method === 'send_invoice'
    );
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
