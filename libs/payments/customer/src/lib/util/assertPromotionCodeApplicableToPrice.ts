/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripePrice,
  StripeProduct,
  StripePromotionCode,
} from '@fxa/payments/stripe';
import { PromotionCodeCouldNotBeAttachedError } from '../error';
import { STRIPE_PRICE_METADATA, STRIPE_PRODUCT_METADATA } from '../types';

export const assertPromotionCodeApplicableToPrice = (
  code: StripePromotionCode,
  price: StripePrice,
  product?: StripeProduct
) => {
  const validPromotionCodes: string[] = [];
  if (price.metadata && price.metadata[STRIPE_PRICE_METADATA.PromotionCodes]) {
    validPromotionCodes.push(
      ...price.metadata[STRIPE_PRICE_METADATA.PromotionCodes]
        .split(',')
        .map((c) => c.trim())
    );
  }
  if (
    product?.metadata &&
    product.metadata[STRIPE_PRODUCT_METADATA.PromotionCodes]
  ) {
    validPromotionCodes.push(
      ...product.metadata[STRIPE_PRODUCT_METADATA.PromotionCodes]
        .split(',')
        .map((c) => c.trim())
    );
  }
  if (!validPromotionCodes.includes(code.code)) {
    throw new PromotionCodeCouldNotBeAttachedError(
      "Promotion code restricted to a product that doesn't match the product on this subscription",
      undefined,
      {
        promotionId: code.id,
      }
    );
  }
};
