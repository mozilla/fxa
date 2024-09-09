/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripePromotionCode } from '@fxa/payments/stripe';
import { PromotionCodeCouldNotBeAttachedError } from '../error';

export const assertPromotionCodeActive = (code: StripePromotionCode) => {
  const nowSecs = Date.now() / 1000;
  if (
    !code ||
    !code.active ||
    !code.coupon.valid ||
    (code.expires_at && code.expires_at < nowSecs)
  )
    throw new PromotionCodeCouldNotBeAttachedError(
      'Invalid promotion code',
      undefined,
      {
        promotionId: code.id,
      }
    );
};
