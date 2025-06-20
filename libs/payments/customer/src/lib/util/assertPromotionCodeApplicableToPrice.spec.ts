/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripePriceFactory,
  StripeProductFactory,
  StripePromotionCodeFactory,
} from '@fxa/payments/stripe';
import { PromotionCodePriceNotValidError } from '../customer.error';
import { STRIPE_PRICE_METADATA, STRIPE_PRODUCT_METADATA } from '../types';
import { assertPromotionCodeApplicableToPrice } from './assertPromotionCodeApplicableToPrice';

describe('assertPromotionCodeApplicableToPrice', () => {
  it('throws error if promotion code is not within price/product promo code list', async () => {
    const mockPrice = StripePriceFactory();
    const mockPromoCode = StripePromotionCodeFactory();

    expect(() =>
      assertPromotionCodeApplicableToPrice(
        mockPromoCode.id,
        mockPrice,
        undefined
      )
    ).toThrowError(PromotionCodePriceNotValidError);
  });

  it('does not throw if promotion code is included in promotion codes for price and no product is provided', async () => {
    const mockPromoCode = StripePromotionCodeFactory({
      code: 'promo_code1',
    });
    const mockPrice = StripePriceFactory({
      metadata: {
        [STRIPE_PRICE_METADATA.PromotionCodes]:
          'promo_code1,promo_code2,promo_code3',
      },
    });

    expect(() =>
      assertPromotionCodeApplicableToPrice(mockPromoCode, mockPrice, undefined)
    ).not.toThrow();
  });

  it('does not throw if promotion code is included in promotion codes for product', async () => {
    const mockPrice = StripePriceFactory({
      metadata: {
        [STRIPE_PRICE_METADATA.PromotionCodes]:
          'promo_code1,promo_code2,promo_code3',
      },
    });
    const mockProduct = StripeProductFactory({
      metadata: {
        [STRIPE_PRODUCT_METADATA.PromotionCodes]:
          'promo_code1,promo_code2,promo_code3',
      },
    });
    const mockPromoCode = StripePromotionCodeFactory({
      code: 'promo_code1',
    });

    expect(() =>
      assertPromotionCodeApplicableToPrice(
        mockPromoCode,
        mockPrice,
        mockProduct
      )
    ).not.toThrow();
  });
});
