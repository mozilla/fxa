/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { PurchaseWithDetailsQuery } from '../../../__generated__/graphql';
import {
  PurchaseWithDetailsPurchaseResult,
  PurchaseWithDetailsResult,
} from '.';

export const PurchaseWithDetailsQueryFactory = (
  override?: Partial<PurchaseWithDetailsQuery>
): PurchaseWithDetailsQuery => {
  return {
    purchase: PurchaseWithDetailsResultFactory(),
    ...override,
  };
};

export const PurchaseWithDetailsResultFactory = (
  override?: Partial<PurchaseWithDetailsResult>
): PurchaseWithDetailsResult => ({
  internalName: faker.string.sample(),
  description: faker.string.sample(),
  purchaseDetails: PurchaseWithDetailsPurchaseResultFactory(),
  ...override,
});

export const PurchaseWithDetailsPurchaseResultFactory = (
  override?: Partial<PurchaseWithDetailsPurchaseResult>
): PurchaseWithDetailsPurchaseResult => ({
  productName: faker.string.sample(),
  details: faker.string.sample(),
  webIcon: faker.string.sample(),
  ...override,
});
