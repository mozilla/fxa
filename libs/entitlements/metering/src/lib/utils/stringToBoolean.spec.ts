/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TransformationType } from 'class-transformer';
import type { TransformFnParams } from 'class-transformer';

import { stringToBoolean } from './stringToBoolean';

function params(value: unknown): TransformFnParams {
  return {
    value,
    key: 'useLocalEmulator',
    obj: {},
    type: TransformationType.PLAIN_TO_CLASS,
    options: {},
  };
}

describe('stringToBoolean', () => {
  it('turns the string "true" into true', () => {
    expect(stringToBoolean(params('true'))).toBe(true);
  });

  it('turns any other string into false', () => {
    expect(stringToBoolean(params('false'))).toBe(false);
    expect(stringToBoolean(params('1'))).toBe(false);
  });

  it('passes a real boolean through unchanged', () => {
    expect(stringToBoolean(params(true))).toBe(true);
    expect(stringToBoolean(params(false))).toBe(false);
  });
});
