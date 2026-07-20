/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripeSubscription } from '@fxa/payments/stripe';
import { getPriceFromSubscription } from './getPriceFromSubscription';
import { getSubplatInterval } from './getSubplatInterval';

export class PriceNotRecurringError extends Error {
  private info: { priceId: string };
  constructor(priceId: string) {
    super('Plan is not recurring');
    this.name = 'SubscriptionRemindersPlanRecurringError';
    this.info = { priceId };
  }
}

export const getSubplatIntervalFromSubscription = (
  subscription: StripeSubscription
) => {
  const price = getPriceFromSubscription(subscription);
  if (!price.recurring) {
    throw new PriceNotRecurringError(price.id);
  }
  return getSubplatInterval(
    price.recurring.interval,
    price.recurring.interval_count
  );
};
