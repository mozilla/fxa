/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  StripeClient,
  StripePrice,
  StripePromotionCode,
} from '@fxa/payments/stripe';
import {
  CouponErrorInvalid,
  PromotionCodeCouldNotBeAttachedError,
} from './error';
import { assertPromotionCodeApplicableToPrice } from './util/assertPromotionCodeApplicableToPrice';
import { assertPromotionCodeActive } from './util/assertPromotionCodeActive';
import { getPriceFromSubscription } from './util/getPriceFromSubscription';

@Injectable()
export class PromotionCodeManager {
  constructor(private stripeClient: StripeClient) {}

  async retrieve(id: string) {
    return this.stripeClient.promotionCodesRetrieve(id);
  }

  async retrieveByName(code: string, active?: boolean) {
    const promotionCodes = await this.stripeClient.promotionCodesList({
      active,
      code,
    });

    return promotionCodes.data.at(0);
  }

  async assertValidPromotionCodeNameForPrice(
    promoCodeName: string,
    price: StripePrice,
    cartCurrency: string
  ) {
    const promoCode = await this.retrieveByName(promoCodeName);
    if (!promoCode)
      throw new PromotionCodeCouldNotBeAttachedError('PromoCode not found');

    // promotion code currency may be null, in which case it is applicable to all currencies
    if (
      promoCode.coupon.currency &&
      promoCode.coupon.currency.toLowerCase() !== cartCurrency.toLowerCase()
    )
      throw new CouponErrorInvalid();

    await this.assertValidPromotionCodeForPrice(promoCode, price);
  }

  async assertValidPromotionCodeForPrice(
    promoCode: StripePromotionCode,
    price: StripePrice
  ) {
    assertPromotionCodeActive(promoCode);

    const productId = price.product;
    const product = await this.stripeClient.productsRetrieve(productId);

    assertPromotionCodeApplicableToPrice(promoCode, price, product);
  }

  async applyPromoCodeToSubscription(
    customerId: string,
    subscriptionId: string,
    promotionId: string
  ) {
    try {
      const subscription = await this.stripeClient.subscriptionsRetrieve(
        subscriptionId
      );
      if (subscription?.status !== 'active')
        throw new PromotionCodeCouldNotBeAttachedError(
          'Subscription is not active',
          undefined,
          { subscriptionId }
        );
      if (subscription.customer !== customerId)
        throw new PromotionCodeCouldNotBeAttachedError(
          'subscription.customerId does not match passed in customerId',
          undefined,
          {
            customerId,
            subscriptionId,
          }
        );

      const price = getPriceFromSubscription(subscription);
      const promoCode = await this.retrieve(promotionId);
      await this.assertValidPromotionCodeForPrice(promoCode, price);

      const updatedSubscription = await this.stripeClient.subscriptionsUpdate(
        subscriptionId,
        {
          discounts: [
            {
              promotion_code: promotionId,
            },
          ],
        }
      );
      return updatedSubscription;
    } catch (err) {
      if (err.type === 'StripeInvalidRequestError') {
        throw new PromotionCodeCouldNotBeAttachedError(
          'Promotion code could not be attached to subscription',
          err,
          {
            customerId,
            subscriptionId,
            promotionId,
          }
        );
      } else {
        throw err;
      }
    }
  }
}
