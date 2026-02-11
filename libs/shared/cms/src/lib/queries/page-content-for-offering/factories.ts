/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { PageContentForOfferingQuery } from '../../../__generated__/graphql';

import {
  PageContentCommonContentResult,
  PageContentOfferingDefaultPurchaseResult,
  PageContentOfferingDefaultPurchaseTransformed,
  PageContentOfferingResult,
  PageContentOfferingTransformed,
  PageContentPurchaseDetailsResult,
  PageContentPurchaseDetailsTransformed,
} from '.';

export const PageContentForOfferingQueryFactory = (
  override?: Partial<PageContentForOfferingQuery>
): PageContentForOfferingQuery => ({
  offerings: [PageContentOfferingResultFactory()],
  ...override,
});

export const PageContentOfferingDefaultPurchaseResultFactory = (
  override?: Partial<PageContentOfferingDefaultPurchaseResult>
): PageContentOfferingDefaultPurchaseResult => ({
  purchaseDetails: {
    ...PageContentPurchaseDetailsResultFactory(),
    localizations: [PageContentPurchaseDetailsResultFactory()],
  },
  ...override,
});

export const PageContentOfferingDefaultPurchaseTransformedFactory = (
  override?: Partial<PageContentOfferingDefaultPurchaseTransformed>
): PageContentOfferingDefaultPurchaseTransformed => ({
  purchaseDetails: {
    ...PageContentPurchaseDetailsTransformedFactory(),
    localizations: [PageContentPurchaseDetailsTransformedFactory()],
  },
  ...override,
});

export const PageContentOfferingResultFactory = (
  override?: Partial<PageContentOfferingResult>
): PageContentOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  countries: [faker.string.sample()],
  stripeProductId: faker.string.sample(),
  defaultPurchase: PageContentOfferingDefaultPurchaseResultFactory(),
  commonContent: {
    ...PageContentCommonContentResultFactory(),
    localizations: [PageContentCommonContentResultFactory()],
  },
  ...override,
});

export const PageContentOfferingTransformedFactory = (
  override?: Partial<PageContentOfferingTransformed>
): PageContentOfferingTransformed => ({
  ...PageContentOfferingResultFactory(),
  defaultPurchase: PageContentOfferingDefaultPurchaseTransformedFactory(),
  ...override,
});

export const PageContentPurchaseDetailsResultFactory = (
  override?: Partial<PageContentPurchaseDetailsResult>
): PageContentPurchaseDetailsResult => ({
  details: `${faker.string.alpha(10)}\n${faker.string.alpha(10)}`,
  productName: faker.string.alpha(10),
  subtitle: faker.string.alpha(10),
  webIcon: faker.internet.url(),
  ...override,
});

export const PageContentPurchaseDetailsTransformedFactory = (
  override?: Partial<PageContentPurchaseDetailsTransformed>
): PageContentPurchaseDetailsTransformed => ({
  ...PageContentPurchaseDetailsResultFactory(),
  details: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () =>
    faker.string.alpha(10)
  ),
  ...override,
});

export const PageContentCommonContentResultFactory = (
  override?: Partial<PageContentCommonContentResult>
): PageContentCommonContentResult => ({
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
