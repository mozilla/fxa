/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getPriceFromSubscription } from '@fxa/payments/customer';
import type { StripeSubscription } from '@fxa/payments/stripe';

import type {
  PriceInfo,
  WebSubscription,
} from '../billing-and-subscriptions.schema';

export const transformToWebSubscription = (
  sub: StripeSubscription,
  priceId: string,
  priceInfo: PriceInfo
): WebSubscription => {
  const productId = getPriceFromSubscription(sub).product;
  if (!productId) {
    throw new Error(
      `Subscription has no product id (subscriptionId=${sub.id})`
    );
  }
  return {
    _subscription_type: 'web',
    created: sub.created,
    current_period_end: sub.current_period_end,
    current_period_start: sub.current_period_start,
    cancel_at_period_end: sub.cancel_at_period_end,
    end_at: sub.ended_at ?? null,
    plan_id: priceId,
    product_id: productId,
    priceInfo,
    status: sub.status,
    subscription_id: sub.id,
  };
};
