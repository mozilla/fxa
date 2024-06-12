/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { ProductManager } from './product.manager';
import { StripeClient } from './stripe.client';
import { PromotionCodeCouldNotBeAttachedError } from './stripe.error';
import {
  checkSubscriptionPromotionCodes,
  checkValidPromotionCode,
  getSubscribedPrice,
} from './stripe.util';
import { SubscriptionManager } from './subscription.manager';

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

      const promotionCode = await this.retrieve(promotionId);

      checkValidPromotionCode(promotionCode);

      const price = getSubscribedPrice(subscription);
      const productId = price.product;
      const product = await this.productManager.retrieve(productId);

      checkSubscriptionPromotionCodes(promotionCode, price, product);

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
