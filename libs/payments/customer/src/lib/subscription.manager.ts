/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { StripeClient, StripeSubscription } from '@fxa/payments/stripe';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '@fxa/payments/stripe';
import { STRIPE_CUSTOMER_METADATA } from './types';

@Injectable()
export class SubscriptionManager {
  constructor(private stripeClient: StripeClient) {}

  async cancel(subscriptionId: string) {
    return this.stripeClient.subscriptionsCancel(subscriptionId);
  }

  async create(
    params: Stripe.SubscriptionCreateParams,
    options?: Stripe.RequestOptions
  ) {
    return this.stripeClient.subscriptionsCreate(params, options);
  }

  async retrieve(subscriptionId: string) {
    return this.stripeClient.subscriptionsRetrieve(subscriptionId);
  }

  async update(
    subscriptionId: string,
    params?: Stripe.SubscriptionUpdateParams
  ) {
    if (params?.metadata) {
      const newMetadata = params.metadata;
      Object.keys(newMetadata).forEach((key) => {
        if (
          !Object.values(STRIPE_CUSTOMER_METADATA).includes(
            key as STRIPE_CUSTOMER_METADATA
          )
        ) {
          throw new Error(`Invalid metadata key: ${key}`);
        }
      });
    }

    return this.stripeClient.subscriptionsUpdate(subscriptionId, params);
  }

  async listForCustomer(customerId: string) {
    const result = await this.stripeClient.subscriptionsList({
      customer: customerId,
    });

    return result.data;
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
        await this.stripeClient.subscriptionsCancel(sub.id);
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
    const latestInvoice = await this.stripeClient.invoicesRetrieve(
      subscription.latest_invoice
    );

    if (!latestInvoice.payment_intent) {
      return;
    }

    const paymentIntent = await this.stripeClient.paymentIntentRetrieve(
      latestInvoice.payment_intent
    );

    return paymentIntent;
  }
}
