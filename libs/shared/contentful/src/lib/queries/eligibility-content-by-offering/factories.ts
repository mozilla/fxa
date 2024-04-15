/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { EligibilityContentByOfferingQuery } from '../../../__generated__/graphql';
import {
  EligibilityContentOfferingResult,
  EligibilityContentSubgroupOfferingResult,
  EligibilityContentSubgroupResult,
} from '.';

export const EligibilityContentByOfferingQueryFactory = (
  override?: Partial<EligibilityContentByOfferingQuery>
): EligibilityContentByOfferingQuery => {
  const items = [EligibilityOfferingResultFactory()];
  return {
    offeringCollection: {
      items,
    },
    ...override,
  };
};

export const EligibilityOfferingResultFactory = (
  override?: Partial<EligibilityContentOfferingResult>
): EligibilityContentOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  stripeProductId: faker.string.sample(),
  stripeLegacyPlans: Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => faker.string.alpha(10)
  ),
  countries: [faker.string.sample()],
  linkedFrom: {
    subGroupCollection: {
      items: [EligibilitySubgroupResultFactory()],
    },
  },
  ...override,
});

export const EligibilitySubgroupResultFactory = (
  override?: Partial<EligibilityContentSubgroupResult>
): EligibilityContentSubgroupResult => ({
  groupName: faker.string.sample(),
  offeringCollection: {
    items: [EligibilitySubgroupOfferingResultFactory()],
  },
  ...override,
});

export const EligibilitySubgroupOfferingResultFactory = (
  override?: Partial<EligibilityContentSubgroupOfferingResult>
): EligibilityContentSubgroupOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  stripeProductId: faker.string.sample(),
  stripeLegacyPlans: Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => faker.string.alpha(10)
  ),
  countries: [faker.string.sample()],
  ...override,
});
