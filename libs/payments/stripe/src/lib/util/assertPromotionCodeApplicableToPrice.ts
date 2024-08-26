/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {
  StripePrice,
  StripeProduct,
  StripePromotionCode,
} from '../stripe.client.types';
import { PromotionCodeCouldNotBeAttachedError } from '../stripe.error';
import {
  STRIPE_PRICE_METADATA,
  STRIPE_PRODUCT_METADATA,
} from '../stripe.types';

export const assertPromotionCodeApplicableToPrice = (
  code: StripePromotionCode,
  price: StripePrice,
  product?: StripeProduct
) => {
  const validPromotionCodes: string[] = [];
  if (price.metadata && price.metadata[STRIPE_PRICE_METADATA.PROMOTION_CODES]) {
    validPromotionCodes.push(
      ...price.metadata[STRIPE_PRICE_METADATA.PROMOTION_CODES]
        .split(',')
        .map((c) => c.trim())
    );
  }
  if (
    product?.metadata &&
    product.metadata[STRIPE_PRODUCT_METADATA.PROMOTION_CODES]
  ) {
    validPromotionCodes.push(
      ...product.metadata[STRIPE_PRODUCT_METADATA.PROMOTION_CODES]
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
