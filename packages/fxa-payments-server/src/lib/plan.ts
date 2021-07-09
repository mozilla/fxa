/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Plan } from '../store/types';

// Figure out a selected plan for a product, either from planId or first plan.
export function getSelectedPlan(
  productId: string,
  planId: string | undefined,
  filterFn: (_: string) => Array<Plan>
) {
  const productPlans = filterFn(productId);
  let selectedPlan = productPlans.filter((plan) => plan.plan_id === planId)[0];
  if (!selectedPlan) {
    selectedPlan = productPlans[0];
  }
  return selectedPlan;
}
