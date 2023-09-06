/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Subscription } from './subscription.types';
import { faker } from '@faker-js/faker';
import { CustomerFactory } from './customer.factory';

// export const SubscriptionFactory = {
//   create(stripeSub: Stripe.Subscription): Subscription {
//     if (typeof stripeSub.customer === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('customer not expanded');
//     }
//     if (typeof stripeSub.default_payment_method === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('default_payment_method not expanded');
//     }
//     if (typeof stripeSub.latest_invoice === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('latest_invoice not expanded');
//     }
//     if (typeof stripeSub.pending_setup_intent === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('pending_setup_intent not expanded');
//     }
//     if (typeof stripeSub.default_source === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('default_source not expanded');
//     }

//     const subscription = {
//       ...stripeSub,
//       customer: stripeSub.customer,
//       default_payment_method: stripeSub.default_payment_method,
//       latest_invoice: stripeSub.latest_invoice,
//       pending_setup_intent: stripeSub.pending_setup_intent,
//       default_source: stripeSub.default_source,
//     } satisfies Subscription;

//     return subscription;
//   },
// };

export const SubscriptionFactory = (
  override: Partial<Subscription>
): Subscription => ({
  id: faker.string.alphanumeric(10),
  object: 'subscription',
  application: null,
  application_fee_percent: null,
  automatic_tax: {
    enabled: true,
  },
  billing_cycle_anchor: 1,
  billing_thresholds: null,
  cancel_at: null,
  cancel_at_period_end: false,
  canceled_at: null,
  cancellation_details: null,
  collection_method: 'charge_automatically',
  created: 1,
  currency: 'USD',
  current_period_end: 1,
  current_period_start: 0,
  customer: CustomerFactory({}),
  days_until_due: null,
  default_payment_method: faker.string.alphanumeric(10),
  default_source: faker.string.alphanumeric(10),
  description: null,
  discount: null,
  ended_at: null,
  latest_invoice: {},
  livemode: false,
  metadata: {},
  next_pending_invoice_item_invoice: null,
  on_behalf_of: null,
  pause_collection: null,
  payment_settings: null,
  pending_invoice_item_interval: null,
  pending_setup_intent: null,
  pending_update: null,
  schedule: null,
  start_date: 0,
  status: 'active',
  test_clock: null,
  transfer_data: null,
  trial_end: null,
  trial_settings: null,
  trial_start: null,
  ...override,
});
