/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { FreeTrial, FreeTrialResult } from './types';

export const FreeTrialResultFactory = (
    override?: Partial<FreeTrialResult>
  ): FreeTrialResult => ({
    freeTrials: [FreeTrialFactory()],
    ...override,
  });

  export const FreeTrialFactory = (
    override?: Partial<FreeTrial>
  ): FreeTrial => ({
    internalName: faker.string.sample(),
    intervals: faker.helpers.arrayElements(
      ['daily', 'weekly', 'monthly', 'halfyearly', 'yearly'],
    ),
    trialLengthDays: faker.number.int({ min: 1, max: 30 }),
    countries: [faker.string.sample()],
    cooldownPeriodMonths: faker.number.int({ min: 1, max: 12 }),
    ...override,
  });
