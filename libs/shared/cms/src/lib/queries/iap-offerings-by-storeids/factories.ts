/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { type Enum_Iap_Interval } from '../../../__generated__/graphql';
import {
  IapOfferingResult,
  type IapOfferingByStoreIDResult,
  type IapOfferingSubGroupOfferingResult,
  type IapOfferingSubGroupResult,
  type IapWithOfferingResult,
  type IapOfferingDefaultPurchase,
  type IapOfferingPurchaseStripePlanChoiceResult,
} from '.';

export const IapOfferingByStoreIDResultFactory = (
  override?: Partial<IapOfferingByStoreIDResult>
): IapOfferingByStoreIDResult => {
  return {
    iaps: [IapWithOfferingResultFactory()],
    ...override,
  } satisfies IapOfferingByStoreIDResult;
};

export const IapWithOfferingResultFactory = (
  override?: Partial<IapWithOfferingResult>
): IapWithOfferingResult => ({
  storeID: faker.string.sample(),
  interval: faker.helpers.arrayElement([
    'monthly',
    'yearly',
    'sixmonthly',
  ]) as Enum_Iap_Interval,
  offering: IapOfferingResultFactory(),
  ...override,
});

export const IapOfferingResultFactory = (
  override?: Partial<IapOfferingResult>
): IapOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  commonContent: {
    supportUrl: faker.internet.url(),
    localizations: [{ supportUrl: faker.internet.url() }],
  },
  defaultPurchase: IapOfferingDefaultPurchaseFactory(),
  subGroups: [IapOfferingSubGroupResultFactory()],
  ...override,
});

export const IapOfferingPurchaseStripePlanChoiceResultFactory = (
  override?: Partial<IapOfferingPurchaseStripePlanChoiceResult>
): IapOfferingPurchaseStripePlanChoiceResult => ({
  stripePlanChoice: `price_${faker.string.alphanumeric({ length: 24 })}`,
  ...override,
});

export const IapOfferingDefaultPurchaseFactory = (
  override?: Partial<IapOfferingDefaultPurchase>
): IapOfferingDefaultPurchase => ({
  stripePlanChoices: [IapOfferingPurchaseStripePlanChoiceResultFactory()],
  purchaseDetails: {
    productName: faker.string.sample(),
    localizations: [{ productName: faker.string.sample() }],
  },
  ...override,
});

export const IapOfferingSubGroupResultFactory = (
  override?: Partial<IapOfferingSubGroupResult>
): IapOfferingSubGroupResult => ({
  groupName: faker.string.sample(),
  offerings: [IapOfferingSubGroupOfferingResultFactory()],
  ...override,
});

export const IapOfferingSubGroupOfferingResultFactory = (
  override?: Partial<IapOfferingSubGroupOfferingResult>
): IapOfferingSubGroupOfferingResult => ({
  apiIdentifier: faker.string.sample(),
  ...override,
});
