/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { mapErrorReason } from './mapErrorReason';

describe('mapErrorReason', () => {
  it('should return the value when it is a valid ErrorReason', () => {
    expect(mapErrorReason('customer_mismatch')).toEqual('customer_mismatch');
  });

  it('should return general_error for an invalid value', () => {
    expect(mapErrorReason('not_a_real_reason')).toEqual('general_error');
  });

  it('should return general_error when value is undefined', () => {
    expect(mapErrorReason(undefined)).toEqual('general_error');
  });

  it('should return general_error when value is an empty string', () => {
    expect(mapErrorReason('')).toEqual('general_error');
  });
});
