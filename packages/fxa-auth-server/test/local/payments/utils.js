/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import { roundTime, sortClientCapabilities } from '../../../lib/payments/utils';

it('checks that roundTime() returns time rounded to the nearest minute', async () => {
  const mockDate = new Date('2023-01-03T17:44:44.400Z');
  const res = roundTime(mockDate);
  const actualTime = '27879464.74';
  const roundedTime = '27879465';

  assert.deepEqual(res, roundedTime);
  assert.notEqual(res, actualTime);
});

it('checks that sortClientCapabilities() returns object sorted by key and capabilities', async () => {
  const mockCapabilities = {
    c1: ['capZZ', 'cap4', 'cap5', 'capAlpha'],
    '*': ['capAll'],
    c2: ['cap5', 'cap6', 'capC', 'capD'],
    c3: ['capE', 'capD'],
  };

  const result = sortClientCapabilities(mockCapabilities);

  const expected = {
    '*': ['capAll'],
    c1: ['cap4', 'cap5', 'capAlpha', 'capZZ'],
    c2: ['cap5', 'cap6', 'capC', 'capD'],
    c3: ['capD', 'capE'],
  };

  assert.deepEqual(result, expected);
});
