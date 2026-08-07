/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { EligibilityContentByPlanIdsQuery } from '../../../__generated__/graphql';
import {
  EligibilityOfferingResult,
  EligibilityPurchaseResult,
  EligibilitySubgroupOfferingResult,
  EligibilitySubgroupRankedOfferingResult,
  EligibilitySubgroupResult,
  type EligibilityContentByPlanIdsResult,
} from '.';

export const EligibilityContentByPlanIdsQueryFactory = (
  override?: Partial<EligibilityContentByPlanIdsQuery>
): EligibilityContentByPlanIdsQuery => {
  return {
    purchases: [EligibilityPurchaseResultFactory()],
    ...override,
  };
};

export const EligibilityContentByPlanIdsResultFactory = (
  override?: Partial<EligibilityContentByPlanIdsResult>
): EligibilityContentByPlanIdsResult => {
  return {
    purchases: [EligibilityPurchaseResultFactory()],
    ...override,
  };
};

export const EligibilityPurchaseResultFactory = (
  override?: Partial<EligibilityPurchaseResult>
): EligibilityPurchaseResult => ({
  stripePlanChoices: [
    {
      stripePlanChoice: faker.string.sample(),
    },
  ],
  offering: EligibilityOfferingResultFactory(),
  ...override,
});

export const EligibilityOfferingResultFactory = (
  override?: Partial<EligibilityOfferingResult>
): EligibilityOfferingResult => ({
  apiIdentifier: faker.string.alpha(10),
  stripeProductId: faker.string.sample(),
  stripeLegacyPlans: Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => ({
      stripeLegacyPlan: faker.string.alpha(10),
    })
  ),
  countries: [faker.string.sample()],
  subGroups: [EligibilitySubgroupResultFactory()],
  ...override,
});

export const EligibilitySubgroupResultFactory = (
  override?: Partial<EligibilitySubgroupResult>
): EligibilitySubgroupResult => {
  const offerings = override?.offerings ?? [
    EligibilitySubgroupOfferingResultFactory(),
  ];
  return {
    groupName: faker.string.sample(),
    offerings,
    rankedOfferings: offerings.map((offering, position) =>
      EligibilitySubgroupRankedOfferingResultFactory({
        position,
        offering: { apiIdentifier: offering.apiIdentifier },
      })
    ),
    ...override,
  };
};

export const EligibilitySubgroupRankedOfferingResultFactory = (
  override?: Partial<EligibilitySubgroupRankedOfferingResult>
): EligibilitySubgroupRankedOfferingResult => ({
  position: faker.number.int({ min: 0, max: 100 }),
  offering: {
    apiIdentifier: faker.string.alpha(10),
  },
  ...override,
});

export const EligibilitySubgroupOfferingResultFactory = (
  override?: Partial<EligibilitySubgroupOfferingResult>
): EligibilitySubgroupOfferingResult => ({
  apiIdentifier: faker.string.alpha(10),
  stripeProductId: faker.string.sample(),
  stripeLegacyPlans: Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => ({
      stripeLegacyPlan: faker.string.alpha(10),
    })
  ),
  countries: [faker.string.sample()],
  ...override,
});
