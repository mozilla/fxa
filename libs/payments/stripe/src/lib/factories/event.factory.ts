/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import Stripe from 'stripe';
import { StripeSubscriptionFactory } from './subscription.factory';
import { StripeSubscription } from '../stripe.client.types';

// TODO - Create generic factory
export const StripeEventCustomerSubscriptionCreatedFactory = (
  override?: Partial<Stripe.Event>,
  dataObjectOverride?: Partial<StripeSubscription>
): Stripe.Event => ({
  id: 'evt_123',
  object: 'event',
  api_version: '2019-02-19',
  created: faker.date.past().getTime(),
  livemode: false,
  request: null,
  pending_webhooks: 0,
  ...override,
  type: 'customer.subscription.created',
  data: {
    object: {
      ...StripeSubscriptionFactory(),
      ...dataObjectOverride,
    },
  },
});

export const StripeEventCustomerSubscriptionDeletedFactory = (
  override?: Partial<Stripe.Event>,
  dataObjectOverride?: Partial<StripeSubscription>
): Stripe.Event => ({
  id: 'evt_123',
  object: 'event',
  api_version: '2019-02-19',
  created: faker.date.past().getTime(),
  livemode: false,
  request: null,
  pending_webhooks: 0,
  ...override,
  type: 'customer.subscription.deleted',
  data: {
    object: {
      ...StripeSubscriptionFactory(),
      ...dataObjectOverride,
    },
  },
});
