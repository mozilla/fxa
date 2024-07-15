/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { ServicesWithCapabilitiesQuery } from '../../../__generated__/graphql';
import { CapabilitiesResult, ServiceResult } from '.';
import { StrapiEntityFactory } from '../../factories';

export const ServicesWithCapabilitiesQueryFactory = (
  override?: Partial<ServicesWithCapabilitiesQuery>
): ServicesWithCapabilitiesQuery => ({
  services: {
    data: [StrapiEntityFactory(ServiceResultFactory())],
  },
  ...override,
});

export const ServiceResultFactory = (
  override?: Partial<ServiceResult>
): ServiceResult => ({
  oauthClientId: faker.string.sample(),
  capabilities: {
    data: [StrapiEntityFactory(CapabilitiesResultFactory())],
  },
  ...override,
});

export const CapabilitiesResultFactory = (
  override?: Partial<CapabilitiesResult>
): CapabilitiesResult => ({
  slug: faker.string.sample(),
  ...override,
});
