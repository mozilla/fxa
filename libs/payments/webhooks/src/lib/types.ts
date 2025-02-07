/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';

export interface DefaultResponse {
  type: Exclude<Stripe.Event.Type, 'customer.subscription.deleted'>;
  event: Stripe.Event;
  eventObjectData: Stripe.Event.Data.Object;
}

export interface CustomerSubscriptionDeletedResponse {
  type: 'customer.subscription.deleted';
  event: Stripe.Event;
  eventObjectData: Stripe.Subscription;
}

export type StripeWebhookEventResponse =
  | DefaultResponse
  | CustomerSubscriptionDeletedResponse;
