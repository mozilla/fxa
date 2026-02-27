/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import type {
  WelcomeFeature,
  FreeTrialFeature,
  Features,
  SubPlatNimbusResult,
} from './nimbus.types';

export const WelcomeFeatureFactory = (
  override?: Partial<WelcomeFeature>
): WelcomeFeature => ({
  enabled: faker.datatype.boolean(),
  ...override,
});

export const FreeTrialFeatureFactory = (
  override?: Partial<FreeTrialFeature>
): FreeTrialFeature => ({
  enabled: faker.datatype.boolean(),
  ...override,
});

export const FeaturesFactory = (override?: Partial<Features>): Features => ({
  'welcome-feature': WelcomeFeatureFactory(),
  'free-trial-feature': FreeTrialFeatureFactory(),
  ...override,
});

export const SubPlatNimbusResultFactory = (
  override?: Partial<SubPlatNimbusResult>
): SubPlatNimbusResult => ({
  Features: FeaturesFactory(),
  Enrollments: [],
  ...override,
});
