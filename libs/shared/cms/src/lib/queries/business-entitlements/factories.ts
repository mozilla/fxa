/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { BusinessEntitlementsQuery } from '../../../__generated__/graphql';

type BusinessEntitlement = NonNullable<
  BusinessEntitlementsQuery['businessEntitlements'][number]
>;
type Capability = NonNullable<BusinessEntitlement['capabilities'][number]>;
type Service = NonNullable<Capability['services'][number]>;
type Matcher = NonNullable<BusinessEntitlement['matchers'][number]>;

export const BusinessEntitlementServiceFactory = (
  override?: Partial<Service>
): Service => ({
  __typename: 'Service',
  oauthClientId: faker.string.alphanumeric({ length: 16 }),
  ...override,
});

export const BusinessEntitlementCapabilityFactory = (
  override?: Partial<Capability>
): Capability => ({
  __typename: 'Capability',
  slug: `cap-${faker.string.alphanumeric({ length: 8 })}`,
  services: [BusinessEntitlementServiceFactory()],
  ...override,
});

export const BusinessEntitlementEmailListMatcherFactory = (
  override?: Partial<Extract<Matcher, { __typename: 'ComponentMatchersEmailList' }>>
): Matcher => ({
  __typename: 'ComponentMatchersEmailList',
  emails: [faker.internet.email().toLowerCase()],
  ...override,
});

export const BusinessEntitlementResultFactory = (
  override?: Partial<BusinessEntitlement>
): BusinessEntitlement => ({
  __typename: 'BusinessEntitlement',
  documentId: faker.string.uuid(),
  internalName: faker.company.name(),
  capabilities: [BusinessEntitlementCapabilityFactory()],
  matchers: [BusinessEntitlementEmailListMatcherFactory()],
  ...override,
});

export const BusinessEntitlementsQueryFactory = (
  override?: Partial<BusinessEntitlementsQuery>
): BusinessEntitlementsQuery => ({
  __typename: 'Query',
  businessEntitlements: [BusinessEntitlementResultFactory()],
  ...override,
});
