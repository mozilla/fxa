/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripePlan } from '../stripe.client.types';

export const StripePlanFactory = (
  override?: Partial<StripePlan>
): StripePlan => ({
  id: `plan_${faker.string.alphanumeric({ length: 24 })}`,
  object: 'plan',
  active: true,
  billing_scheme: 'per_unit',
  created: faker.number.int(),
  currency: faker.finance.currencyCode(),
  livemode: false,
  metadata: {},
  nickname: null,
  product: `prod_${faker.string.alphanumeric({ length: 14 })}`,
  tiers_mode: null,
  aggregate_usage: null,
  amount: faker.number.int({ max: 1000 }),
  amount_decimal: faker.commerce.price({ min: 1000 }),
  interval: 'month',
  interval_count: 1,
  transform_usage: null,
  trial_period_days: null,
  usage_type: 'licensed',
  ...override,
});
