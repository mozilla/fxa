/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  CancelInterstitialOffer,
  CancelInterstitialOfferOfferingResult,
  CancelInterstitialOfferResult,
  CancelInterstitialOfferTransformed,
} from './types';
import {
  Enum_Cancelinterstitialoffer_Currentinterval,
  Enum_Cancelinterstitialoffer_Upgradeinterval,
} from '../../../__generated__/graphql';

export const CancelInterstitialOfferResultFactory = (
  override?: Partial<CancelInterstitialOfferResult>
): CancelInterstitialOfferResult => ({
  cancelInterstitialOffers: [CancelInterstitialOfferFactory()],
  ...override,
});

export const CancelInterstitialOfferOfferingResultFactory = (
  override?: Partial<CancelInterstitialOfferOfferingResult>
): CancelInterstitialOfferOfferingResult => ({
  stripeProductId: faker.string.sample(),
  defaultPurchase: {
    purchaseDetails: {
      webIcon: faker.image.urlLoremFlickr(),
      productName: faker.string.sample(),
      localizations: [
        {
          webIcon: faker.image.urlLoremFlickr(),
          productName: faker.string.sample(),
        },
      ],
    },
  },
  ...override,
});

export const CancelInterstitialOfferFactory = (
  override?: Partial<CancelInterstitialOffer>
): CancelInterstitialOffer => ({
  offeringApiIdentifier: faker.string.sample(),
  currentInterval: faker.helpers.enumValue(
    Enum_Cancelinterstitialoffer_Currentinterval
  ),
  upgradeInterval: faker.helpers.enumValue(
    Enum_Cancelinterstitialoffer_Upgradeinterval
  ),
  advertisedSavings: faker.number.int({ min: 0, max: 100 }),
  ctaMessage: faker.lorem.sentence(),
  modalHeading1: faker.lorem.sentence(),
  modalHeading2: faker.lorem.sentence(),
  modalMessage: Array.from(
    { length: faker.number.int({ min: 1, max: 4 }) },
    () => faker.string.alpha(10)
  ).join('\n'),
  productPageUrl: faker.internet.url(),
  upgradeButtonLabel: faker.lorem.words(2),
  upgradeButtonUrl: faker.internet.url(),
  localizations: [],
  offering: CancelInterstitialOfferOfferingResultFactory(),
  ...override,
});

export const CancelInterstitialOfferTransformedFactory = (
  override?: Partial<CancelInterstitialOfferTransformed>
): CancelInterstitialOfferTransformed => ({
  ...CancelInterstitialOfferFactory(),
  modalMessage: Array.from(
    { length: faker.number.int({ min: 1, max: 4 }) },
    () => faker.string.alpha(10)
  ),
  ...override,
});
