/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeApiList,
  StripePlan,
  StripeSubscription,
} from './stripe.client.types';

/**
 * Returns array of customer subscription plans
 */
export async function getSubscribedPlans(
  subscriptionList: StripeApiList<StripeSubscription>
) {
  const subscriptions = subscriptionList.data;
  if (!subscriptions) return [];
  return subscriptions
    .flatMap((sub) => sub.items.data)
    .map((item) => item.plan as StripePlan);
}

/**
 * Returns array of subscribed product IDs
 */
export async function getSubscribedProductIds(subscribedPlans: StripePlan[]) {
  return subscribedPlans.length > 0
    ? subscribedPlans.map(({ product: productId }) => productId as string)
    : [];
}
