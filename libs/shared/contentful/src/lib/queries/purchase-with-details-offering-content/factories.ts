/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import {
  OfferingCommonContentResult,
  PurchaseDetailsResult,
  PurchaseDetailsTransformed,
  PurchaseOfferingResult,
  PurchaseWithDetailsOfferingContentByPlanIdsResult,
  PurchaseWithDetailsOfferingContentResult,
  PurchaseWithDetailsOfferingContentTransformed,
} from './types';

export const PurchaseDetailsResultFactory = (
  override?: Partial<PurchaseDetailsResult>
): PurchaseDetailsResult => ({
  details: `${faker.string.alpha(10)}\n${faker.string.alpha(10)}`,
  productName: faker.string.alpha(10),
  subtitle: faker.string.alpha(10),
  webIcon: faker.internet.url(),
  ...override,
});

export const PurchaseDetailsTransformedFactory = (
  override?: Partial<PurchaseDetailsTransformed>
): PurchaseDetailsTransformed => ({
  ...PurchaseDetailsResultFactory(),
  details: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () =>
    faker.string.alpha(10)
  ),
  ...override,
});

export const OfferingCommonContentResultFactory = (
  override?: Partial<OfferingCommonContentResult>
): OfferingCommonContentResult => ({
  privacyNoticeUrl: faker.internet.url(),
  privacyNoticeDownloadUrl: faker.internet.url(),
  termsOfServiceUrl: faker.internet.url(),
  termsOfServiceDownloadUrl: faker.internet.url(),
  cancellationUrl: faker.internet.url(),
  emailIcon: faker.internet.url(),
  successActionButtonUrl: faker.internet.url(),
  successActionButtonLabel: faker.string.alpha(10),
  newsletterLabelTextCode: faker.helpers.arrayElement([
    'snp',
    'hubs',
    'mdnplus',
  ]),
  newsletterSlug: faker.helpers.arrayElements([
    'mozilla-accounts',
    'security-privacy-news',
    'hubs',
    'mdnplus',
  ]),
  ...override,
});

export const PurchaseOfferingResultFactory = (
  override?: Partial<PurchaseOfferingResult>
): PurchaseOfferingResult => ({
  stripeProductId: faker.string.alpha(10),
  stripeLegacyPlans: Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => faker.string.alpha(10)
  ),
  commonContent: OfferingCommonContentResultFactory(),
  ...override,
});

export const PurchaseWithDetailsOfferingContentResultFactory = (
  override?: Partial<PurchaseWithDetailsOfferingContentResult>
): PurchaseWithDetailsOfferingContentResult => ({
  stripePlanChoices: Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => faker.string.alpha(10)
  ),
  purchaseDetails: PurchaseDetailsResultFactory(),
  offering: PurchaseOfferingResultFactory(),
  ...override,
});

export const PurchaseWithDetailsOfferingContentTransformedFactory = (
  override?: Partial<PurchaseWithDetailsOfferingContentTransformed>
): PurchaseWithDetailsOfferingContentTransformed => ({
  ...PurchaseWithDetailsOfferingContentResultFactory(),
  purchaseDetails: PurchaseDetailsTransformedFactory(),
  ...override,
});

export const PurchaseWithDetailsOfferingContentByPlanIdsResultFactory = (
  override?: Partial<PurchaseWithDetailsOfferingContentByPlanIdsResult>
): PurchaseWithDetailsOfferingContentByPlanIdsResult => ({
  purchaseCollection: {
    items: [PurchaseWithDetailsOfferingContentResultFactory()],
  },
  ...override,
});
