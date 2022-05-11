/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PlanConfig } from '../../../subscriptions/configuration/plan';
import { ProductConfig } from '../../../subscriptions/configuration/product';

export const planConfigurationDtoOmitKeys = [
  'active',
  'capabilities',
  'id',
  'productConfigId',
  'promotionCodes',
] as const;

export type PlanConfigurationDtoT = Omit<
  PlanConfig & ProductConfig,
  typeof planConfigurationDtoOmitKeys[number]
>;

export const formatPlanConfigDto: (
  x: PlanConfig & ProductConfig
) => PlanConfigurationDtoT = (planConfig) =>
  // @ts-ignore
  Object.keys(planConfig).reduce((acc, k) => {
    // @ts-ignore
    if (!planConfigurationDtoOmitKeys.includes(k)) {
      // @ts-ignore
      acc[k] = planConfig[k];
    }
    return acc;
  }, {});
