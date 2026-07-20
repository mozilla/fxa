/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { AccessesQuery } from '../../../__generated__/graphql';
import type {
  FreeAccessCapabilityMap,
  FreeAccessProjection,
  FreeAccessProjectionEntry,
  FreeAccessRecord,
  NormalizedAccess,
  ProjectionResult,
  ProjectionSkip,
  ProjectionSkipReason,
} from './types';

type Access = NonNullable<AccessesQuery['accesses'][number]>;
type Offering = NonNullable<Access['offerings'][number]>;
type Capability = NonNullable<Offering['capabilities'][number]>;
type Service = NonNullable<Capability['services'][number]>;
type Matcher = NonNullable<Access['matchers'][number]>;

export const AccessServiceFactory = (
  override?: Partial<Service>
): Service => ({
  __typename: 'Service',
  oauthClientId: faker.string.alphanumeric({ length: 16 }),
  ...override,
});

export const AccessCapabilityFactory = (
  override?: Partial<Capability>
): Capability => ({
  __typename: 'Capability',
  slug: `cap-${faker.string.alphanumeric({ length: 8 })}`,
  services: [AccessServiceFactory()],
  ...override,
});

export const AccessOfferingFactory = (
  override?: Partial<Offering>
): Offering => ({
  __typename: 'Offering',
  apiIdentifier: `offering-${faker.string.alphanumeric({ length: 8 })}`,
  capabilities: [AccessCapabilityFactory()],
  ...override,
});

export const AccessEmailListMatcherFactory = (
  override?: Partial<
    Extract<Matcher, { __typename: 'ComponentMatchersEmailList' }>
  >
): Matcher => ({
  __typename: 'ComponentMatchersEmailList',
  emails: [faker.internet.email().toLowerCase()],
  ...override,
});

export const AccessResultFactory = (
  override?: Partial<Access>
): Access => ({
  __typename: 'Access',
  documentId: faker.string.uuid(),
  internalName: faker.company.name(),
  offerings: [AccessOfferingFactory()],
  matchers: [AccessEmailListMatcherFactory()],
  ...override,
});

export const AccessesQueryFactory = (
  override?: Partial<AccessesQuery>
): AccessesQuery => ({
  __typename: 'Query',
  accesses: [AccessResultFactory()],
  ...override,
});

/* ---------------- Projection factories ---------------- */

export const FreeAccessCapabilityMapFactory = (
  override?: FreeAccessCapabilityMap
): FreeAccessCapabilityMap =>
  override ?? {
    [`client-${faker.string.alphanumeric({ length: 8 }).toLowerCase()}`]: [
      `cap-${faker.string.alphanumeric({ length: 8 })}`,
    ],
  };

export const FreeAccessRecordFactory = (
  override?: Partial<FreeAccessRecord>
): FreeAccessRecord => ({
  entitlementId: faker.string.uuid(),
  email: faker.internet.email().toLowerCase(),
  offeringApiIdentifiers: [
    `offering-${faker.string.alphanumeric({ length: 8 })}`,
  ],
  capabilities: FreeAccessCapabilityMapFactory(),
  expiresAt: faker.date.future().getTime(),
  description: faker.lorem.sentence(),
  internalName: faker.company.name(),
  createdAt: faker.date.recent().getTime(),
  ...override,
});

export const FreeAccessProjectionEntryFactory = (
  override?: Partial<FreeAccessProjectionEntry>
): FreeAccessProjectionEntry => ({
  capabilities: FreeAccessCapabilityMapFactory(),
  offeringApiIdentifiers: [
    `offering-${faker.string.alphanumeric({ length: 8 })}`,
  ],
  ...override,
});

export const FreeAccessProjectionFactory = (
  entries?: ReadonlyArray<{
    email: string;
    entry?: Partial<FreeAccessProjectionEntry>;
  }>
): FreeAccessProjection => {
  const source = entries ?? [
    { email: faker.internet.email().toLowerCase() },
  ];
  const out: FreeAccessProjection = {};
  for (const { email, entry } of source) {
    out[email.toLowerCase()] = FreeAccessProjectionEntryFactory(entry);
  }
  return out;
};

export const NormalizedAccessFactory = (
  override?: Partial<NormalizedAccess>
): NormalizedAccess => ({
  documentId: faker.string.uuid(),
  internalName: faker.company.name(),
  offeringApiIdentifiers: [
    `offering-${faker.string.alphanumeric({ length: 8 })}`,
  ],
  capabilities: [
    {
      slug: `cap-${faker.string.alphanumeric({ length: 8 })}`,
      services: [
        {
          oauthClientId: `client-${faker.string
            .alphanumeric({ length: 8 })
            .toLowerCase()}`,
        },
      ],
    },
  ],
  emailLists: [
    { [faker.internet.email().toLowerCase()]: ['2099-12-31', ''] },
  ],
  ...override,
});

const PROJECTION_SKIP_REASONS: readonly ProjectionSkipReason[] = [
  'missing-document-id',
  'no-capabilities',
  'malformed-emails',
  'array-email-form',
  'empty-email',
  'malformed-tuple',
  'invalid-date',
  'past-expiry',
];

export const ProjectionSkipFactory = (
  override?: Partial<ProjectionSkip>
): ProjectionSkip => ({
  reason: faker.helpers.arrayElement(PROJECTION_SKIP_REASONS),
  ...override,
});

export const ProjectionResultFactory = (
  override?: Partial<ProjectionResult>
): ProjectionResult => ({
  records: [FreeAccessRecordFactory()],
  skipped: [],
  ...override,
});
