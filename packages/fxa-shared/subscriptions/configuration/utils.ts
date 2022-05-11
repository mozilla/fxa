/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PlanConfig } from './plan';
import { ProductConfig } from './product';

/**
 * Build a "complete" config from merging the product's config into the plan's
 * config.  The plan's config values have a high precedence.
 */
export const mergeConfigs = (
  planConfig: PlanConfig,
  productConfig: ProductConfig
): PlanConfig & ProductConfig => ({
  ...planConfig,

  capabilities: {
    ...productConfig.capabilities,
    ...planConfig.capabilities,
  },
  urls: { ...productConfig.urls, ...planConfig.urls },
  uiContent: { ...productConfig.uiContent, ...planConfig.uiContent },
  styles: { ...productConfig.styles, ...planConfig.styles },
  locales: { ...productConfig.locales, ...planConfig.locales },
  support: { ...productConfig.support, ...planConfig.support },
  productSet: planConfig.productSet || productConfig.productSet,
  promotionCodes: [
    ...new Set([
      ...(productConfig.promotionCodes || []),
      ...(planConfig.promotionCodes || []),
    ]),
  ],
});

export const mapPlanConfigsByPriceId = (configs: PlanConfig[]) =>
  configs.reduce(
    (acc: { [key: string]: PlanConfig }, planConfig: PlanConfig) => {
      if (planConfig.stripePriceId) {
        acc[planConfig.stripePriceId] = planConfig;
      }
      return acc;
    },
    {}
  );
