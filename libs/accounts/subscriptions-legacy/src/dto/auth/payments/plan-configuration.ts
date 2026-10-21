/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MergedPlanConfig,
  PlanConfig,
} from '../../../subscriptions/configuration/plan';
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
  (typeof planConfigurationDtoOmitKeys)[number]
>;

export const formatPlanConfigDto: (
  x: MergedPlanConfig
) => PlanConfigurationDtoT = (planConfig) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Object.keys(planConfig).reduce((acc, k) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!planConfigurationDtoOmitKeys.includes(k)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      acc[k] = planConfig[k];
    }
    return acc;
  }, {});
