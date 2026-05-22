/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import {
  METERING_WINDOWS,
  type MeterBySlugResult,
  type StrapiMeter,
  type StrapiMeterWebhook,
} from './types';

export const StrapiMeterWebhookFactory = (
  override?: Partial<StrapiMeterWebhook>
): StrapiMeterWebhook => ({
  url: faker.internet.url(),
  signingClientId: faker.string.uuid(),
  ...override,
});

export const StrapiMeterFactory = (
  override?: Partial<StrapiMeter>
): StrapiMeter => ({
  slug: faker.lorem.slug(),
  unit: faker.helpers.arrayElement(['tokens', 'bytes', 'requests']),
  limit: faker.number.int({ min: 100, max: 1_000_000 }),
  window: faker.helpers.arrayElement(METERING_WINDOWS),
  notificationThresholds: [80, 100],
  webhooks: [],
  ...override,
});

export const MeterBySlugResultFactory = (
  override?: Partial<MeterBySlugResult>
): MeterBySlugResult => ({
  meters: [StrapiMeterFactory()],
  ...override,
});
