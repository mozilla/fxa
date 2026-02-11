/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  StripeClient,
  StripePrice,
  StripePromotionCode,
  type StripeCustomer,
} from '@fxa/payments/stripe';
import {
  CouponErrorCannotRedeem,
  CouponErrorInvalidCurrency,
  PromotionCodeCouldNotBeAttachedError,
  PromotionCodeCustomerSubscriptionMismatchError,
  PromotionCodeNotFoundError,
  PromotionCodeSubscriptionInactiveError,
} from './customer.error';
import { assertPromotionCodeApplicableToPrice } from './util/assertPromotionCodeApplicableToPrice';
import { assertPromotionCodeActive } from './util/assertPromotionCodeActive';
import { getPriceFromSubscription } from './util/getPriceFromSubscription';
import { InvoiceManager } from './invoice.manager';
import type { TaxAddress } from './types';

@Injectable()
export class PromotionCodeManager {
  constructor(
    private stripeClient: StripeClient,
    private invoiceManager: InvoiceManager
  ) { }

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
    if (!promoCode) {
      throw new PromotionCodeNotFoundError(
        promoCodeName,
        price.id,
        cartCurrency
      );
    }

    // promotion code currency may be null, in which case it is applicable to all currencies
    if (
      promoCode.coupon.currency &&
      promoCode.coupon.currency.toLowerCase() !== cartCurrency.toLowerCase()
    )
      throw new CouponErrorInvalidCurrency();

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
      const subscription =
        await this.stripeClient.subscriptionsRetrieve(subscriptionId);
      if (subscription?.status !== 'active') {
        throw new PromotionCodeSubscriptionInactiveError(
          subscriptionId,
          promotionId,
          customerId
        );
      }
      if (subscription.customer !== customerId) {
        throw new PromotionCodeCustomerSubscriptionMismatchError(
          customerId,
          subscriptionId,
          subscription.customer,
          promotionId
        );
      }

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
          err,
          customerId,
          subscriptionId,
          promotionId
        );
      } else {
        throw err;
      }
    }
  }

  async assertValidForPriceAndCustomer(
    promoCodeName: string,
    price: StripePrice,
    currency: string,
    customer?: StripeCustomer,
    taxAddress?: TaxAddress,
  ) {
    await this.assertValidPromotionCodeNameForPrice(promoCodeName, price, currency);

    if (customer) {
      try {
        await this.invoiceManager.previewUpcoming({
          priceId: price.id,
          currency,
          customer,
          taxAddress,
          couponCode: promoCodeName,
        });
      } catch (e) {
        if (
          e.type === 'StripeInvalidRequestError' &&
          e.message ===
          'This promotion code cannot be redeemed because the associated customer has prior transactions.'
        ) {
          throw new CouponErrorCannotRedeem();
        } else {
          throw e;
        }
      }
    }
  }
}
