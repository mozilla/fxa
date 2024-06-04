/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { StripeClient } from './stripe.client';
import { StripePlan } from './stripe.client.types';
import {
  PlanIntervalMultiplePlansError,
  PlanNotFoundError,
} from './stripe.error';
import { SubplatInterval } from './stripe.types';
import { doesPlanMatchSubplatInterval } from './util/doesPlanMatchSubplatInterval';

@Injectable()
export class PriceManager {
  constructor(private client: StripeClient) {}

  async retrieve(planId: string) {
    const plan = await this.client.plansRetrieve(planId);
    if (!plan) throw new PlanNotFoundError();
    return plan;
  }

  async retrieveByInterval(planIds: string[], interval: SubplatInterval) {
    const plans: StripePlan[] = [];
    for (const planId of planIds) {
      const plan = await this.retrieve(planId);
      if (doesPlanMatchSubplatInterval(plan, interval)) {
        plans.push(plan);
      }
    }
    if (plans.length > 1) throw new PlanIntervalMultiplePlansError();
    return plans.at(0);
  }
}
