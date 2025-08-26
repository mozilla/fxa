/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { StripeClient, StripeSubscription } from '@fxa/payments/stripe';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '@fxa/payments/stripe';
import { type StripeSubscriptionMetadataInput } from './types';

@Injectable()
export class SubscriptionManager {
  constructor(private stripeClient: StripeClient) {}

  async cancel(
    subscriptionId: string,
    params?: Stripe.SubscriptionCancelParams
  ) {
    return this.stripeClient.subscriptionsCancel(subscriptionId, params);
  }

  async create(
    params: Omit<Stripe.SubscriptionCreateParams, 'metadata'> & {
      metadata?: StripeSubscriptionMetadataInput
    },
    options?: Stripe.RequestOptions
  ) {
    return this.stripeClient.subscriptionsCreate(params, options);
  }

  async retrieve(subscriptionId: string) {
    return this.stripeClient.subscriptionsRetrieve(subscriptionId);
  }

  async update(
    subscriptionId: string,
    params: Omit<Stripe.SubscriptionUpdateParams, 'metadata'> & {
      metadata?: StripeSubscriptionMetadataInput
    },
  ) {
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

  async retrieveForCustomerAndPrice(customerId: string, priceId: string) {
    const subscriptions = await this.listForCustomer(customerId);
    return subscriptions.find((sub) =>
      sub.items.data.find((subItem) => subItem.price.id === priceId)
    );
  }

  getPaymentProvider(subscription: StripeSubscription): 'paypal' | 'stripe' {
    return subscription.collection_method === 'send_invoice'
      ? 'paypal'
      : 'stripe';
  }

  async getCustomerPayPalSubscriptions(customerId: string) {
    const subscriptions = await this.listForCustomer(customerId);
    if (!subscriptions) return [];
    return subscriptions.filter(
      (sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status) &&
        this.getPaymentProvider(sub) === 'paypal'
    );
  }
}
