/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { ServicesWithCapabilitiesQuery } from '../../../__generated__/graphql';
import { CapabilitiesResult, ServiceResult } from '.';

export const ServicesWithCapabilitiesQueryFactory = (
  override?: Partial<ServicesWithCapabilitiesQuery>
): ServicesWithCapabilitiesQuery => ({
  serviceCollection: {
    items: [ServiceResultFactory()],
  },
  ...override,
});

export const ServiceResultFactory = (
  override?: Partial<ServiceResult>
): ServiceResult => ({
  oauthClientId: faker.string.sample(),
  capabilitiesCollection: {
    items: [CapabilitiesResultFactory()],
  },
  ...override,
});

export const CapabilitiesResultFactory = (
  override?: Partial<CapabilitiesResult>
): CapabilitiesResult => ({
  slug: faker.string.sample(),
  ...override,
});
