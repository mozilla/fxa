/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripeSubscription } from '@fxa/payments/stripe';
import { UniqueSubscriptionItemNotFoundError } from '../customer.error';

export const getPriceFromSubscription = (subscription: StripeSubscription) => {
  const item = subscription.items.data.at(0);
  if (!item || subscription.items.data.length > 1)
    throw new UniqueSubscriptionItemNotFoundError(subscription.id);
  return item.price;
};
