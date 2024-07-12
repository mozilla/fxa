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
import { StrapiEntityFactory } from '../../factories';

export const EligibilityContentByOfferingQueryFactory = (
  override?: Partial<EligibilityContentByOfferingQuery>
): EligibilityContentByOfferingQuery => {
  return {
    offerings: {
      data: [StrapiEntityFactory(EligibilityContentOfferingResultFactory())],
    },
    ...override,
  };
};

export const EligibilityContentOfferingResultFactory = (
  override?: Partial<EligibilityContentOfferingResult>
): EligibilityContentOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  stripeProductId: faker.string.sample(),
  defaultPurchase: {
    data: StrapiEntityFactory({
      stripePlanChoices: [
        {
          stripePlanChoice: faker.string.sample(),
        },
      ],
    }),
  },
  subGroups: {
    data: [StrapiEntityFactory(EligibilityContentSubgroupResultFactory())],
  },
  ...override,
});

export const EligibilityContentSubgroupResultFactory = (
  override?: Partial<EligibilityContentSubgroupResult>
): EligibilityContentSubgroupResult => ({
  groupName: faker.string.sample(),
  offerings: {
    data: [
      StrapiEntityFactory({
        apiIdentifier: faker.string.sample(),
        stripeProductId: faker.string.sample(),
        defaultPurchase: {
          data: StrapiEntityFactory({
            stripePlanChoices: [
              {
                stripePlanChoice: faker.string.sample(),
              },
            ],
          }),
        },
      }),
    ],
  },
  ...override,
});

export const EligibilityContentSubgroupOfferingResultFactory = (
  override?: Partial<EligibilityContentSubgroupOfferingResult>
): EligibilityContentSubgroupOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  stripeProductId: faker.string.sample(),
  defaultPurchase: {
    data: StrapiEntityFactory({
      stripePlanChoices: [
        {
          stripePlanChoice: faker.string.sample(),
        },
      ],
    }),
  },
  ...override,
});
