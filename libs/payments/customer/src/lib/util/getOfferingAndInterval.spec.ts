/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TODO

import {
  StripePriceFactory,
  StripePriceRecurringFactory,
} from '@fxa/payments/stripe';
import { SubplatInterval } from '../types';
import { doesPriceMatchSubplatInterval } from './doesPriceMatchSubplatInterval';

describe('doesPriceMatchSubplatInterval', () => {
  const price = StripePriceFactory({
    recurring: StripePriceRecurringFactory({
      interval: 'week',
    }),
  });

  it('returns true when price matches interval', () => {
    const result = doesPriceMatchSubplatInterval(price, SubplatInterval.Weekly);

    expect(result).toEqual(true);
  });

  it('does not return prices that do not match interval', () => {
    const result = doesPriceMatchSubplatInterval(price, SubplatInterval.Daily);

    expect(result).toEqual(false);
  });
});
