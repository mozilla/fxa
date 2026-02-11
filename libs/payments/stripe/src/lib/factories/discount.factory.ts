/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeDiscount } from '../stripe.client.types';

export const StripeDiscountFactory = (
  override?: Partial<StripeDiscount>
): StripeDiscount => ({
  id: `di_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'discount',
  checkout_session: `cs_test_${faker.string.alphanumeric({ length: 60 })}`,
  coupon: {
    id: 'wsd',
    object: 'coupon',
    amount_off: null,
    created: faker.number.int(),
    currency: null,
    duration: 'forever',
    duration_in_months: null,
    livemode: false,
    max_redemptions: null,
    metadata: {},
    name: null,
    percent_off: faker.number.int({ min: 1, max: 100 }),
    redeem_by: null,
    times_redeemed: faker.number.int(),
    valid: true,
  },
  customer: `cus_${faker.string.alphanumeric({ length: 14 })}`,
  end: null,
  invoice: null,
  invoice_item: null,
  promotion_code: null,
  start: faker.number.int(),
  subscription: null,
  subscription_item: null,
  ...override,
});
