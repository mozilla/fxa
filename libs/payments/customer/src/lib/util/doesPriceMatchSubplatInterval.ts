/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripePrice } from '@fxa/payments/stripe';
import { SubplatInterval } from '../types';
import { subplatIntervalToInterval } from '../constants';

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
