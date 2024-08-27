/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripeSubscription } from '../stripe.client.types';
import { PromotionCodeCouldNotBeAttachedError } from '../stripe.error';

export const getPriceFromSubscription = (subscription: StripeSubscription) => {
  const item = subscription.items.data.at(0);
  if (!item || subscription.items.data.length > 1)
    throw new PromotionCodeCouldNotBeAttachedError(
      'Unknown subscription price',
      undefined,
      {
        subscriptionId: subscription.id,
      }
    );
  return item.price;
};
