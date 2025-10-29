/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import type {
  NimbusContext,
  NimbusEnrollment,
  NimbusResult,
} from './nimbus.types';

export const NimbusContextFactory = (
  override?: Partial<NimbusContext>
): NimbusContext => ({
  language: faker.location.language().alpha2,
  region: faker.location.countryCode('alpha-2'),
  ...override,
});

export const NimbusEnrollmentFactory = (
  override?: Partial<NimbusEnrollment>
): NimbusEnrollment => ({
  nimbus_user_id: faker.string.uuid(),
  app_id: faker.string.uuid(),
  experiment: faker.lorem.word(),
  branch: faker.helpers.arrayElement(['develop', 'stage', 'prod']),
  experiment_type: faker.helpers.arrayElement(['feature', 'abtest']),
  is_preview: faker.datatype.boolean().toString(),
  ...override,
});

export const NimbusResultFactory = (
  override?: Partial<NimbusResult>
): NimbusResult => ({
  Features: {},
  Enrollments: [],
  ...override,
});
