/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { OfferingQuery } from '../../../__generated__/graphql';
import {
  OfferingPurchaseResult,
  OfferingDefaultPurchaseResult,
  OfferingResult,
} from '.';

export const OfferingQueryFactory = (
  override?: Partial<OfferingQuery>
): OfferingQuery => ({
  offering: OfferingResultFactory(),
  ...override,
});

export const OfferingResultFactory = (
  override?: Partial<OfferingResult>
): OfferingResult => {
  return {
    stripeProductId: faker.string.sample(),
    countries: [faker.string.sample()],
    defaultPurchase: OfferingDefaultPurchaseResultFactory(),
    ...override,
  };
};

export const OfferingDefaultPurchaseResultFactory = (
  override?: Partial<OfferingDefaultPurchaseResult>
): OfferingDefaultPurchaseResult => ({
  purchaseDetails: OfferingPurchaseResultFactory(),
  ...override,
});

export const OfferingPurchaseResultFactory = (
  override?: Partial<OfferingPurchaseResult>
): OfferingPurchaseResult => ({
  productName: faker.string.sample(),
  details: faker.string.sample(),
  subtitle: faker.string.sample(),
  webIcon: faker.string.sample(),
  ...override,
});
