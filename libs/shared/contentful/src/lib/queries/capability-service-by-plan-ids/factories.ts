/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { CapabilityServiceByPlanIdsQuery } from '../../../__generated__/graphql';
import {
  CapabilityPurchaseResult,
  CapabilityOfferingResult,
  CapabilityCapabilitiesResult,
  CapabilityServicesResult,
} from '.';

export const CapabilityServiceByPlanIdsQueryFactory = (
  override?: Partial<CapabilityServiceByPlanIdsQuery>
): CapabilityServiceByPlanIdsQuery => {
  return {
    purchaseCollection: {
      items: [CapabilityPurchaseResultFactory()],
    },
    ...override,
  };
};

export const CapabilityPurchaseResultFactory = (
  override?: Partial<CapabilityPurchaseResult>
): CapabilityPurchaseResult => ({
  stripePlanChoices: [faker.string.sample()],
  offering: CapabilityOfferingResultFactory(),
  ...override,
});

export const CapabilityOfferingResultFactory = (
  override?: Partial<CapabilityOfferingResult>
): CapabilityOfferingResult => ({
  capabilitiesCollection: {
    items: [CapabilityCapabilitiesResultFactory()],
  },
  ...override,
});

export const CapabilityCapabilitiesResultFactory = (
  override?: Partial<CapabilityCapabilitiesResult>
): CapabilityCapabilitiesResult => ({
  slug: faker.string.sample(),
  servicesCollection: {
    items: [CapabilityServicesResultFactory()],
  },
  ...override,
});

export const CapabilityServicesResultFactory = (
  override?: Partial<CapabilityServicesResult>
): CapabilityServicesResult => ({
  oauthClientId: faker.string.sample(),
  ...override,
});
