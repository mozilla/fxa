/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripePrice } from '../stripe.client.types';
import { SubplatInterval } from '../stripe.types';

interface Interval {
  interval: NonNullable<StripePrice['recurring']>['interval'];
  intervalCount: number;
}

const subplatIntervalToInterval = {
  [SubplatInterval.Daily]: {
    interval: 'day',
    intervalCount: 1,
  },
  [SubplatInterval.Weekly]: {
    interval: 'week',
    intervalCount: 1,
  },
  [SubplatInterval.Monthly]: {
    interval: 'month',
    intervalCount: 1,
  },
  [SubplatInterval.HalfYearly]: {
    interval: 'month',
    intervalCount: 6,
  },
  [SubplatInterval.Yearly]: {
    interval: 'year',
    intervalCount: 1,
  },
} satisfies Record<SubplatInterval, Interval>;

export const doesPriceMatchSubplatInterval = (
  price: StripePrice,
  subplatInterval: SubplatInterval
) => {
  const stripeInterval = subplatIntervalToInterval[subplatInterval];

  return (
    price.recurring?.interval === stripeInterval.interval &&
    price.recurring?.interval_count === stripeInterval.intervalCount
  );
};
