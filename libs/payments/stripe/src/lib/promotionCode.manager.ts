/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { ProductManager } from './product.manager';
import { StripeClient } from './stripe.client';
import { PromotionCodeCouldNotBeAttachedError } from './stripe.error';
import {
  assertSubscriptionPromotionCodes,
  assertValidPromotionCode,
  getSubscribedPrice,
} from './stripe.util';
import { SubscriptionManager } from './subscription.manager';
import type { StripePrice, StripePromotionCode } from './stripe.client.types';

@Injectable()
export class PromotionCodeManager {
  constructor(
    private client: StripeClient,
    private productManager: ProductManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  async retrieve(id: string) {
    return this.client.promotionCodesRetrieve(id);
  }

  async retrieveByName(code: string, active?: boolean) {
    const promotionCodes = await this.client.promotionCodesList({
      active,
      code,
    });

    return promotionCodes.data.at(0);
  }

  async assertValidPromotionCodeNameForPrice(
    promoCodeName: string,
    price: StripePrice
  ) {
    const promoCode = await this.retrieveByName(promoCodeName);
    if (!promoCode)
      throw new PromotionCodeCouldNotBeAttachedError('PromoCode not found');

    await this.assertValidPromotionCodeForPrice(promoCode, price);
  }

  async assertValidPromotionCodeForPrice(
    promoCode: StripePromotionCode,
    price: StripePrice
  ) {
    assertValidPromotionCode(promoCode);

    const productId = price.product;
    const product = await this.productManager.retrieve(productId);

    assertSubscriptionPromotionCodes(promoCode, price, product);
  }

  async applyPromoCodeToSubscription(
    customerId: string,
    subscriptionId: string,
    promotionId: string
  ) {
    try {
      const subscription = await this.subscriptionManager.retrieve(
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

      const price = getSubscribedPrice(subscription);
      const promoCode = await this.retrieve(promotionId);
      await this.assertValidPromotionCodeForPrice(promoCode, price);

      const updatedSubscription = await this.subscriptionManager.update(
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
