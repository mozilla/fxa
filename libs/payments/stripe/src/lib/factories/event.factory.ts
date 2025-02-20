/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import Stripe from 'stripe';
import { StripeSubscriptionFactory } from './subscription.factory';
import { StripeSubscription } from '../stripe.client.types';

// TODO - Create generic factory
export const StripeEventCustomerSubscriptionCreatedFactory = (
  dataObjectOverride?: Partial<StripeSubscription>
): Stripe.Event => ({
  id: 'evt_123',
  object: 'event',
  api_version: '2019-02-19',
  created: faker.date.past().getTime(),
  data: {
    object: {
      ...StripeSubscriptionFactory(),
      ...dataObjectOverride,
    },
  },
  livemode: false,
  request: null,
  pending_webhooks: 0,
  type: 'customer.subscription.created',
});

export const StripeEventCustomerSubscriptionDeletedFactory = (
  dataObjectOverride?: Partial<StripeSubscription>
): Stripe.Event => ({
  id: 'evt_123',
  object: 'event',
  api_version: '2019-02-19',
  created: faker.date.past().getTime(),
  data: {
    object: {
      ...StripeSubscriptionFactory(),
      ...dataObjectOverride,
    },
  },
  livemode: false,
  request: null,
  pending_webhooks: 0,
  type: 'customer.subscription.deleted',
});
