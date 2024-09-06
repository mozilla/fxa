/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeResponseFactory,
  StripeCouponFactory,
  StripePromotionCodeFactory,
} from '@fxa/payments/stripe';
import { PromotionCodeCouldNotBeAttachedError } from '../error';
import { assertPromotionCodeActive } from './assertPromotionCodeActive';

describe('assertPromotionCodeActive', () => {
  it('throws error if there is no promotion code', async () => {
    const mockPromotionCode = StripeResponseFactory(undefined);

    expect(() => assertPromotionCodeActive(mockPromotionCode)).toThrowError(
      PromotionCodeCouldNotBeAttachedError
    );
  });

  it('throws error if the promotion code is not active', async () => {
    const mockPromotionCode = StripePromotionCodeFactory({
      active: false,
    });

    expect(() => assertPromotionCodeActive(mockPromotionCode)).toThrowError(
      PromotionCodeCouldNotBeAttachedError
    );
  });

  it('throws error if the promotion code coupon is not valid', async () => {
    const mockPromotionCode = StripePromotionCodeFactory({
      coupon: StripeCouponFactory({
        valid: false,
      }),
    });

    expect(() => assertPromotionCodeActive(mockPromotionCode)).toThrowError(
      PromotionCodeCouldNotBeAttachedError
    );
  });

  it('throws error if the promotion code is expired', async () => {
    const expiredTime = Date.now() / 1000 - 50;
    const mockPromotionCode = StripePromotionCodeFactory({
      expires_at: expiredTime,
    });

    expect(() => assertPromotionCodeActive(mockPromotionCode)).toThrowError(
      PromotionCodeCouldNotBeAttachedError
    );
  });

  it('does not throw if the promotion code is valid', async () => {
    const mockPromotionCode = StripePromotionCodeFactory({
      active: true,
    });

    expect(() => assertPromotionCodeActive(mockPromotionCode)).not.toThrow();
  });
});
