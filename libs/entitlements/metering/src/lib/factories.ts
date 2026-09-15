/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Timestamp } from '@google-cloud/firestore';

import type { AuthenticatedMeteringClient } from './metering-auth.guard';
import type {
  IngestUsageRequest,
  UsageQueryParams,
  UsageQueryResponse,
} from './metering.schema';
import type { UsageGrantRecord } from './usage-grants.repository';
import type {
  CreateUsageGrantRequest,
  UsageGrant,
} from './usage-grants.schema';

export const IngestUsageRequestFactory = (
  override?: Partial<IngestUsageRequest>
): IngestUsageRequest => ({
  id: faker.string.uuid(),
  userIdentifier: faker.string.uuid(),
  slug: faker.lorem.slug(),
  amount: faker.number.int({ min: 1, max: 1000 }),
  timestamp: new Date().toISOString(),
  ...override,
});

export const UsageQueryParamsFactory = (
  override?: Partial<UsageQueryParams>
): UsageQueryParams => ({
  userIdentifier: faker.string.uuid(),
  slug: faker.lorem.slug(),
  ...override,
});

export const UsageQueryResponseFactory = (
  override?: Partial<UsageQueryResponse>
): UsageQueryResponse => ({
  usage: faker.number.int({ min: 0, max: 1000 }),
  limit: faker.number.int({ min: 1000, max: 10000 }),
  grantedAmount: 0,
  unit: 'tokens',
  windowStart: new Date('2026-05-01T00:00:00.000Z').toISOString(),
  windowEnd: new Date('2026-06-01T00:00:00.000Z').toISOString(),
  ...override,
});

export const CreateUsageGrantRequestFactory = (
  override?: Partial<CreateUsageGrantRequest>
): CreateUsageGrantRequest => ({
  userIdentifier: faker.string.uuid(),
  slug: faker.lorem.slug(),
  amount: faker.number.int({ min: 1, max: 1000 }),
  lifetime: { type: 'unending' },
  ...override,
});

export const UsageGrantRecordFactory = (
  override?: Partial<UsageGrantRecord>
): UsageGrantRecord => ({
  id: faker.string.uuid(),
  userIdentifier: faker.string.uuid(),
  slug: faker.lorem.slug(),
  amount: faker.number.int({ min: 1, max: 1000 }),
  grantedBy: faker.string.uuid(),
  createdAt: Timestamp.fromDate(new Date('2026-05-01T00:00:00.000Z')),
  expiresAt: null,
  ...override,
});

export const UsageGrantFactory = (
  override?: Partial<UsageGrant>
): UsageGrant => ({
  id: faker.string.uuid(),
  userIdentifier: faker.string.uuid(),
  slug: faker.lorem.slug(),
  amount: faker.number.int({ min: 1, max: 1000 }),
  grantedBy: faker.string.uuid(),
  createdAt: new Date('2026-05-01T00:00:00.000Z').toISOString(),
  expiresAt: null,
  active: true,
  ...override,
});

export const AuthenticatedMeteringClientFactory = (
  override?: Partial<AuthenticatedMeteringClient>
): AuthenticatedMeteringClient => ({
  clientId: faker.string.uuid(),
  ...override,
});
