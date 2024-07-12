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
import { StrapiEntityFactory } from '../../factories';

export const PageContentForOfferingQueryFactory = (
  override?: Partial<PageContentForOfferingQuery>
): PageContentForOfferingQuery => ({
  offerings: {
    meta: {
      pagination: {
        total: 1,
      },
    },
    data: [StrapiEntityFactory(PageContentOfferingResultFactory())],
  },
  ...override,
});

export const PageContentOfferingDefaultPurchaseResultFactory = (
  override?: Partial<PageContentOfferingDefaultPurchaseResult>
): PageContentOfferingDefaultPurchaseResult => ({
  purchaseDetails: {
    data: StrapiEntityFactory({
      ...PageContentPurchaseDetailsResultFactory(),
      localizations: {
        data: [StrapiEntityFactory(PageContentPurchaseDetailsResultFactory())],
      },
    }),
  },
  ...override,
});

export const PageContentOfferingDefaultPurchaseTransformedFactory = (
  override?: Partial<PageContentOfferingDefaultPurchaseTransformed>
): PageContentOfferingDefaultPurchaseTransformed => ({
  purchaseDetails: {
    data: StrapiEntityFactory({
      ...PageContentPurchaseDetailsTransformedFactory(),
      localizations: {
        data: [
          StrapiEntityFactory(PageContentPurchaseDetailsTransformedFactory()),
        ],
      },
    }),
  },
  ...override,
});

export const PageContentOfferingResultFactory = (
  override?: Partial<PageContentOfferingResult>
): PageContentOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  stripeProductId: faker.string.sample(),
  defaultPurchase: {
    data: StrapiEntityFactory({
      ...PageContentOfferingDefaultPurchaseResultFactory(),
      localizations: {
        data: [
          StrapiEntityFactory(
            PageContentOfferingDefaultPurchaseResultFactory()
          ),
        ],
      },
    }),
  },
  commonContent: {
    data: StrapiEntityFactory({
      ...PageContentCommonContentResultFactory(),
      localizations: {
        data: [StrapiEntityFactory(PageContentCommonContentResultFactory())],
      },
    }),
  },
  ...override,
});

export const PageContentOfferingTransformedFactory = (
  override?: Partial<PageContentOfferingTransformed>
): PageContentOfferingTransformed => ({
  ...PageContentOfferingResultFactory(),
  defaultPurchase: {
    data: StrapiEntityFactory({
      ...PageContentOfferingDefaultPurchaseTransformedFactory(),
      localizations: {
        data: [
          StrapiEntityFactory(
            PageContentOfferingDefaultPurchaseTransformedFactory()
          ),
        ],
      },
    }),
  },
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
  newsletterLabelTextCode: faker.helpers.arrayElements([
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
