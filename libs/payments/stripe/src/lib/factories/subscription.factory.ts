/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Stripe } from 'stripe';
import { SubscriptionItemFactory } from './subscription-item.factory';

export const SubscriptionFactory = (
  override?: Partial<Stripe.Subscription>
): Stripe.Subscription => ({
  id: `sub_${faker.string.alphanumeric({ length: 24 })}`,
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
  created: faker.number.int(),
  currency: faker.finance.currencyCode(),
  current_period_end: faker.number.int({ min: 1000000 }),
  current_period_start: faker.number.int({ max: 1000000 }),
  customer: `cus_${faker.string.alphanumeric({ length: 14 })}`,
  days_until_due: null,
  default_payment_method: faker.string.alphanumeric(10),
  default_source: faker.string.alphanumeric(10),
  description: null,
  discount: null,
  ended_at: null,
  items: {
    object: 'list',
    data: [SubscriptionItemFactory()],
    has_more: false,
    url: `/v1/subscription_items?subscription=sub_${faker.string.alphanumeric({
      length: 24,
    })}`,
  },
  latest_invoice: `in_${faker.string.alphanumeric({ length: 24 })}`,
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
  start_date: faker.number.int(),
  status: 'active',
  test_clock: null,
  transfer_data: null,
  trial_end: null,
  trial_settings: null,
  trial_start: null,
  ...override,
});
