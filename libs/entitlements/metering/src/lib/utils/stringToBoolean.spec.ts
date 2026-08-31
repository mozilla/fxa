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

  it('turns the string "false" into false', () => {
    expect(stringToBoolean(params('false'))).toBe(false);
  });

  it('leaves any other string unchanged so validation can reject it', () => {
    expect(stringToBoolean(params('treu'))).toBe('treu');
    expect(stringToBoolean(params('1'))).toBe('1');
  });

  it('passes a real boolean through unchanged', () => {
    expect(stringToBoolean(params(true))).toBe(true);
    expect(stringToBoolean(params(false))).toBe(false);
  });
});
