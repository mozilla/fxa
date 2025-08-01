/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { ProductNameByPriceIdsQuery } from '../../../__generated__/graphql';
import {
  ProductNameOfferingResult,
  ProductNamePurchaseResult,
  ProductNamePurchaseDetailsResult,
} from '.';

export const ProductNameByPriceIdsQueryFactory = (
  override?: Partial<ProductNameByPriceIdsQuery>
): ProductNameByPriceIdsQuery => {
  return {
    purchases: [ProductNamePurchaseResultFactory()],
    ...override,
  };
};

export const ProductNamePurchaseResultFactory = (
  override?: Partial<ProductNamePurchaseResult>
): ProductNamePurchaseResult => ({
  offering: ProductNameOfferingResultFactory(),
  purchaseDetails: ProductNamePurchaseDetailsResultFactory(),
  stripePlanChoices: [
    {
      stripePlanChoice: faker.string.sample(),
    },
  ],
  ...override,
});

export const ProductNameOfferingResultFactory = (
  override?: Partial<ProductNameOfferingResult>
): ProductNameOfferingResult => ({
  stripeLegacyPlans: Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => ({
      stripeLegacyPlan: faker.string.alpha(10),
    })
  ),
  ...override,
});

export const ProductNamePurchaseDetailsResultFactory = (
  override?: Partial<ProductNamePurchaseDetailsResult>
): ProductNamePurchaseDetailsResult => ({
  productName: faker.string.sample(),
  ...override,
});
