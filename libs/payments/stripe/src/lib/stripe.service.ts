/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import {
  PromotionCodeCouldNotBeAttachedError,
  SubscriptionCustomerIdDoesNotMatchCustomerIdError,
  SubscriptionNotActiveError,
} from './stripe.error';
import { StripeManager } from './stripe.manager';
import {
  checkSubscriptionPromotionCodes,
  checkValidPromotionCode,
  getSubscribedPrice,
} from './stripe.util';

@Injectable()
export class StripeService {
  constructor(private stripeManager: StripeManager) {}

  async applyPromoCodeToSubscription(
    customerId: string,
    subscriptionId: string,
    promotionId: string
  ) {
    try {
      const subscription = await this.stripeManager.retrieveSubscription(
        subscriptionId
      );
      if (subscription?.status !== 'active')
        throw new SubscriptionNotActiveError();
      if (subscription.customer !== customerId)
        throw new SubscriptionCustomerIdDoesNotMatchCustomerIdError();

      const promotionCode = await this.stripeManager.retrievePromotionCode(
        promotionId
      );

      checkValidPromotionCode(promotionCode);

      const price = getSubscribedPrice(subscription);
      const productId = price.product;
      const product = await this.stripeManager.retrieveProduct(productId);

      checkSubscriptionPromotionCodes(promotionCode.code, price, product);

      const updatedSubscription = await this.stripeManager.updateSubscription(
        subscriptionId,
        {
          promotion_code: promotionCode.code,
        }
      );

      return updatedSubscription;
    } catch (error) {
      throw new PromotionCodeCouldNotBeAttachedError(error);
    }
  }

  // TODO: this method should be moved down to the manager layer
  async customerChanged(uid: string, email: string) {
    // @todo - Unblocked by FXA-9274
    //const devices = await this.db.devices(uid);
    // @todo - Unblocked by FXA-9275
    //await this.profile.deleteCache(uid);
    // @todo - Unblocked by FXA-9276
    //await this.push.notifyProfileUpdated(uid, devices);
    // @todo - Unblocked by FXA-9277
    //this.log.notifyAttachedServices('profileDataChange', {} as any, {
    //  uid,
    //  email,
    //});
  }
}
