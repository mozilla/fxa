/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeCoupon } from '../stripe.client.types';

export const StripeCouponFactory = (
  override?: Partial<StripeCoupon>
): StripeCoupon => ({
  id: faker.string.alphanumeric({ length: 8 }),
  object: 'coupon',
  amount_off: null,
  created: faker.number.int(),
  currency: null,
  duration: 'repeating',
  duration_in_months: faker.number.int({ min: 1, max: 6 }),
  livemode: false,
  max_redemptions: null,
  metadata: {},
  name: null,
  percent_off: faker.number.float({ min: 1, max: 100 }),
  redeem_by: null,
  times_redeemed: faker.number.int(),
  valid: true,
  ...override,
});
