/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import {
  ChurnInterventionByProductIdQuery,
  Enum_Churnintervention_Churntype,
  Enum_Churnintervention_Interval,
} from '../../../__generated__/graphql';

import {
  ChurnInterventionByProductIdRawResult,
  ChurnInterventionByProductIdResult,
  ChurnInterventionByProductIdOfferingResult,
  ChurnInterventionByProductIdChurnInterventionsResult,
  CmsOfferingContent,
} from '.';

export const ChurnInterventionByProductIdChurnInterventionsResultFactory = (
  override?: Partial<ChurnInterventionByProductIdChurnInterventionsResult>
): ChurnInterventionByProductIdChurnInterventionsResult => ({
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

export const ChurnInterventionByProductIdOfferingsResultFactory = (
  override?: Partial<ChurnInterventionByProductIdOfferingResult>
): ChurnInterventionByProductIdOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  defaultPurchase: {
    purchaseDetails: {
      productName: faker.string.sample(),
      webIcon: faker.image.urlLoremFlickr(),
      localizations: [
        {
          productName: faker.string.sample(),
          webIcon: faker.image.urlLoremFlickr(),
        },
      ],
    },
  },
  commonContent: {
    successActionButtonUrl: faker.internet.url(),
    supportUrl: faker.internet.url(),
  },
  churnInterventions: [
    {
      ...ChurnInterventionByProductIdChurnInterventionsResultFactory(),
      localizations: [],
    },
  ],
  ...override,
});

export const ChurnInterventionByProductIdQueryFactory = (
  override?: Partial<ChurnInterventionByProductIdQuery>
): ChurnInterventionByProductIdQuery => ({
  offerings: [ChurnInterventionByProductIdOfferingsResultFactory()],
  ...override,
});

export const ChurnInterventionByProductIdRawResultFactory = (
  override?: Partial<ChurnInterventionByProductIdRawResult>
): ChurnInterventionByProductIdRawResult => ({
  offerings: [ChurnInterventionByProductIdOfferingsResultFactory()],
  ...override,
});

export const ChurnInterventionByProductIdResultFactory = (
  override?: Partial<ChurnInterventionByProductIdResult>
): ChurnInterventionByProductIdResult => ({
  apiIdentifier: faker.string.sample(),
  productName: faker.string.sample(),
  webIcon: faker.image.urlLoremFlickr(),
  churnInterventionId: faker.string.uuid(),
  churnType: faker.helpers.enumValue(Enum_Churnintervention_Churntype),
  redemptionLimit: faker.number.int({ min: 1, max: 10 }),
  stripeCouponId: faker.string.sample(),
  interval: faker.helpers.enumValue(Enum_Churnintervention_Interval),
  discountAmount: faker.number.int({ min: 100, max: 5000 }),
  ctaMessage: faker.lorem.sentence(),
  modalHeading: faker.lorem.sentence(),
  modalMessage: [faker.lorem.paragraph()],
  productPageUrl: faker.internet.url(),
  termsHeading: faker.lorem.sentence(),
  termsDetails: [faker.lorem.paragraphs(2)],
  supportUrl: faker.internet.url(),
  ...override,
});

export const CmsOfferingContentFactory = (
  override?: Partial<CmsOfferingContent>
): CmsOfferingContent => ({
  productName: faker.string.sample(),
  successActionButtonUrl: faker.internet.url(),
  supportUrl: faker.internet.url(),
  webIcon: faker.image.urlLoremFlickr(),
  ...override,
});
