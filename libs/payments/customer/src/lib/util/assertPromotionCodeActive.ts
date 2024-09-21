/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripePromotionCode } from '@fxa/payments/stripe';
import {
  CouponErrorExpired,
  CouponErrorGeneric,
  CouponErrorInvalid,
  CouponErrorLimitReached,
} from '../error';

export const assertPromotionCodeActive = (code: StripePromotionCode) => {
  const nowSecs = Date.now() / 1000;
  if (code.expires_at && code.expires_at < nowSecs)
    throw new CouponErrorExpired();

  if (code.max_redemptions && code.times_redeemed >= code.max_redemptions)
    throw new CouponErrorLimitReached();

  if (code.coupon && !code.coupon.valid) throw new CouponErrorInvalid();

  if (!code || !code.active) throw new CouponErrorGeneric();
};
