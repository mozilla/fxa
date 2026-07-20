/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { formatPlanInterval } from './helpers';

describe('formatPlanInterval', () => {
  it.each([
    { interval: 'monthly', expected: 'Monthly' },
    { interval: 'yearly', expected: 'Yearly' },
    { interval: 'halfyearly', expected: '6-month' },
    { interval: 'weekly', expected: 'Weekly' },
    { interval: 'daily', expected: 'Daily' },
  ])(
    'formats "$interval" as "$expected"',
    ({ interval, expected }) => {
      expect(formatPlanInterval(interval)).toBe(expected);
    }
  );
});
