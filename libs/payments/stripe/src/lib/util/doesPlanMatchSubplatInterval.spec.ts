/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripePlanFactory } from '../factories/plan.factory';
import { SubplatInterval } from '../stripe.types';
import { doesPlanMatchSubplatInterval } from './doesPlanMatchSubplatInterval';

describe('doesPlanMatchSubplatInterval', () => {
  it('returns true when plan matches interval', () => {
    const plan = StripePlanFactory({
      interval: 'week',
      interval_count: 1,
    });

    const result = doesPlanMatchSubplatInterval(plan, SubplatInterval.Weekly);

    expect(result).toEqual(true);
  });

  it('does not return plans that do not match interval', () => {
    const plan = StripePlanFactory({
      interval: 'week',
      interval_count: 1,
    });

    const result = doesPlanMatchSubplatInterval(plan, SubplatInterval.Daily);

    expect(result).toEqual(false);
  });
});
