/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import {
  ChurnInterventionByOfferingQuery,
  Enum_Churnintervention_Churntype,
  Enum_Churnintervention_Interval,
} from '../../../__generated__/graphql';

import {
  ChurnInterventionByOfferingRawResult,
  ChurnInterventionByOfferingResult,
  ChurnInterventionByOfferingOfferingResult,
  ChurnInterventionByOfferingChurnInterventionsResult,
} from '.';

export const ChurnInterventionByOfferingChurnInterventionsResultFactory = (
  override?: Partial<ChurnInterventionByOfferingChurnInterventionsResult>
): ChurnInterventionByOfferingChurnInterventionsResult => ({
  churnInterventionId: faker.string.uuid(),
  churnType: faker.helpers.enumValue(Enum_Churnintervention_Churntype),
  redemptionLimit: faker.number.int({ min: 1, max: 10 }),
  stripeCouponId: faker.string.sample(),
  interval: faker.helpers.enumValue(Enum_Churnintervention_Interval),
  discountAmount: faker.number.int({ min: 100, max: 5000 }),
  ctaMessage: faker.lorem.sentence(),
  modalHeading: faker.lorem.sentence(),
  modalMessage: faker.lorem.paragraph(),
  productPageUrl: faker.internet.url(),
  termsHeading: faker.lorem.sentence(),
  termsDetails: faker.lorem.paragraphs(2),
  ...override,
});

export const ChurnInterventionByOfferingOfferingsResultFactory = (
  override?: Partial<ChurnInterventionByOfferingOfferingResult>
): ChurnInterventionByOfferingOfferingResult => ({
  defaultPurchase: {
    purchaseDetails: {
      webIcon: faker.image.urlLoremFlickr(),
      localizations: [
        {
          webIcon: faker.image.urlLoremFlickr(),
        },
      ],
    },
  },
  commonContent: {
    supportUrl: faker.internet.url(),
  },
  churnInterventions: [
    ChurnInterventionByOfferingChurnInterventionsResultFactory(),
  ],
  ...override,
});

export const ChurnInterventionByOfferingQueryFactory = (
  override?: Partial<ChurnInterventionByOfferingQuery>
): ChurnInterventionByOfferingQuery => ({
  offerings: [ChurnInterventionByOfferingOfferingsResultFactory()],
  ...override,
});

export const ChurnInterventionByOfferingRawResultFactory = (
  override?: Partial<ChurnInterventionByOfferingRawResult>
): ChurnInterventionByOfferingRawResult => ({
  offerings: [ChurnInterventionByOfferingOfferingsResultFactory()],
  ...override,
});

export const ChurnInterventionByOfferingResultFactory = (
  override?: Partial<ChurnInterventionByOfferingResult>
): ChurnInterventionByOfferingResult => ({
  webIcon: faker.image.urlLoremFlickr(),
  churnInterventionId: faker.string.uuid(),
  churnType: faker.helpers.enumValue(Enum_Churnintervention_Churntype),
  redemptionLimit: faker.number.int({ min: 1, max: 10 }),
  stripeCouponId: faker.string.sample(),
  interval: faker.helpers.enumValue(Enum_Churnintervention_Interval),
  discountAmount: faker.number.int({ min: 100, max: 5000 }),
  ctaMessage: faker.lorem.sentence(),
  modalHeading: faker.lorem.sentence(),
  modalMessage: faker.lorem.paragraph(),
  productPageUrl: faker.internet.url(),
  termsHeading: faker.lorem.sentence(),
  termsDetails: faker.lorem.paragraphs(2),
  supportUrl: faker.internet.url(),
  ...override,
});
