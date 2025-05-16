/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripePrice } from '../stripe.client.types';
import { Stripe } from 'stripe';

export const StripePriceCurrencyOptionFactory = (
  override?: Partial<Stripe.Price.CurrencyOptions>
): Stripe.Price.CurrencyOptions => ({
  custom_unit_amount: null,
  tax_behavior: 'exclusive',
  unit_amount: faker.number.int({ max: 1000 }),
  unit_amount_decimal: faker.commerce.price({ min: 1000 }),
  ...override,
})

export const StripePriceFactory = (
  override?: Partial<StripePrice>
): StripePrice => {
  const currency = override?.currency || faker.finance.currencyCode().toLowerCase();
  const unit_amount = override?.unit_amount || faker.number.int({ max: 1000 });
  const unit_amount_decimal = override?.unit_amount_decimal || faker.commerce.price({ min: 1000 });
  return {
    id: `price_${faker.string.alphanumeric({ length: 24 })}`,
    object: 'price',
    active: true,
    billing_scheme: 'per_unit',
    created: faker.number.int(),
    currency,
    currency_options: {
      [currency]: StripePriceCurrencyOptionFactory({
        unit_amount,
        unit_amount_decimal,
      }),
    },
    custom_unit_amount: null,
    livemode: false,
    lookup_key: null,
    metadata: {},
    nickname: null,
    product: `prod_${faker.string.alphanumeric({ length: 14 })}`,
    recurring: StripePriceRecurringFactory(),
    tax_behavior: 'exclusive',
    tiers_mode: null,
    transform_quantity: null,
    type: 'recurring',
    unit_amount,
    unit_amount_decimal,
    ...override,
  }
}

export const StripePriceRecurringFactory = (
  override?: Partial<StripePrice['recurring']>
): StripePrice['recurring'] => ({
  aggregate_usage: null,
  meter: null,
  interval: faker.helpers.arrayElement(['day', 'week', 'month', 'year']),
  interval_count: 1,
  trial_period_days: null,
  usage_type: 'licensed',
  ...override,
});
