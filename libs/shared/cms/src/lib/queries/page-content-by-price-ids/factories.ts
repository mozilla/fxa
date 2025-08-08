/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { PageContentByPriceIdsQuery } from '../../../__generated__/graphql';
import {
  PageContentByPriceIdsOfferingResult,
  PageContentByPriceIdsPurchaseResult,
  PageContentByPriceIdsPurchaseDetailsResult,
  type PageContentByPriceIdsResult,
} from '.';

export const PageContentByPriceIdsQueryFactory = (
  override?: Partial<PageContentByPriceIdsQuery>
): PageContentByPriceIdsQuery => {
  return {
    purchases: [PageContentByPriceIdsPurchaseResultFactory()],
    ...override,
  };
};

export const PageContentByPriceIdByPriceIdsResultFactory = (
  override?: Partial<PageContentByPriceIdsResult>
): PageContentByPriceIdsResult => ({
  purchases: [PageContentByPriceIdsPurchaseResultFactory()],
  ...override,
});

export const PageContentByPriceIdsPurchaseResultFactory = (
  override?: Partial<PageContentByPriceIdsPurchaseResult>
): PageContentByPriceIdsPurchaseResult => ({
  offering: PageContentByPriceIdsOfferingResultFactory(),
  purchaseDetails: {
    ...PageContentByPriceIdsPurchaseDetailsResultFactory(),
    localizations: [PageContentByPriceIdsPurchaseDetailsResultFactory()],
  },
  stripePlanChoices: [
    {
      stripePlanChoice: faker.string.sample(),
    },
  ],
  ...override,
});

export const PageContentByPriceIdsOfferingResultFactory = (
  override?: Partial<PageContentByPriceIdsOfferingResult>
): PageContentByPriceIdsOfferingResult => ({
  stripeLegacyPlans: Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => ({
      stripeLegacyPlan: faker.string.alpha(10),
    })
  ),
  ...override,
});

export const PageContentByPriceIdsPurchaseDetailsResultFactory = (
  override?: Partial<PageContentByPriceIdsPurchaseDetailsResult>
): PageContentByPriceIdsPurchaseDetailsResult => ({
  productName: faker.string.sample(),
  webIcon: faker.internet.url(),
  ...override,
});
