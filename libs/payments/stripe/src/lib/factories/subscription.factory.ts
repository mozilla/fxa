/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { PriceFactory } from './price.factory';
import {
  StripeApiList,
  StripeSubscription,
  StripeSubscriptionItem,
} from '../stripe.client.types';

export const SubscriptionFactory = (
  override?: Partial<StripeSubscription>
): StripeSubscription => ({
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

export const SubscriptionItemFactory = (
  override?: Partial<StripeSubscriptionItem>
): StripeSubscriptionItem => ({
  id: `si_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'subscription_item',
  billing_thresholds: null,
  created: faker.number.int(),
  metadata: {},
  plan: {
    id: `plan_${faker.string.alphanumeric({ length: 14 })}`,
    object: 'plan',
    active: true,
    aggregate_usage: null,
    amount: faker.number.int({ max: 1000 }),
    amount_decimal: faker.commerce.price({ min: 1000 }),
    billing_scheme: 'per_unit',
    created: faker.number.int(),
    currency: faker.finance.currencyCode(),
    interval: 'month',
    interval_count: 1,
    livemode: false,
    metadata: {
      productOrder: '1',
    },
    nickname: faker.string.alphanumeric(),
    product: `prod_${faker.string.alphanumeric({ length: 24 })}`,
    tiers_mode: null,
    transform_usage: null,
    trial_period_days: null,
    usage_type: 'licensed',
  },
  price: PriceFactory(),
  quantity: 1,
  subscription: `sub_${faker.string.alphanumeric({ length: 24 })}`,
  tax_rates: [],
  ...override,
});

export const SubscriptionListFactory = (
  override?: Partial<StripeApiList<StripeSubscription>>
): StripeApiList<StripeSubscription> => ({
  object: 'list',
  url: '/v1/subscriptions',
  has_more: false,
  data: [SubscriptionFactory()],
  ...override,
});
