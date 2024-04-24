/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripePromotionCode } from '../stripe.client.types';

export const StripePromotionCodeFactory = (
  override?: Partial<StripePromotionCode>
): StripePromotionCode => ({
  id: `promo_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'promotion_code',
  code: faker.string.uuid(),
  active: true,
  coupon: {
    id: faker.string.uuid(),
    object: 'coupon',
    amount_off: null,
    created: faker.date.recent().getTime() / 1000,
    currency: null,
    duration: 'repeating',
    duration_in_months: faker.number.int(),
    livemode: true,
    max_redemptions: null,
    metadata: {},
    name: null,
    percent_off: faker.number.int({ min: 10, max: 90 }),
    redeem_by: null,
    times_redeemed: faker.number.int(),
    valid: true,
  },
  created: faker.date.recent().getTime() / 1000,
  customer: null,
  expires_at: null,
  livemode: true,
  max_redemptions: null,
  metadata: {},
  restrictions: {
    first_time_transaction: false,
    minimum_amount: null,
    minimum_amount_currency: null,
  },
  times_redeemed: faker.number.int(),
  ...override,
});
