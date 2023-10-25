/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Stripe } from 'stripe';
import { PriceFactory } from './price.factory';

export const SubscriptionItemFactory = (
  override?: Partial<Stripe.SubscriptionItem>
): Stripe.SubscriptionItem => ({
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
