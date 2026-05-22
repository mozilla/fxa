/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import type { AuthenticatedMeteringClient } from './metering-auth.guard';
import type {
  IngestUsageRequest,
  UsageQueryParams,
  UsageQueryResponse,
} from './metering.schema';

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
  unit: 'tokens',
  windowStart: new Date('2026-05-01T00:00:00.000Z').toISOString(),
  windowEnd: new Date('2026-06-01T00:00:00.000Z').toISOString(),
  ...override,
});

export const AuthenticatedMeteringClientFactory = (
  override?: Partial<AuthenticatedMeteringClient>
): AuthenticatedMeteringClient => ({
  clientId: faker.string.uuid(),
  ...override,
});
