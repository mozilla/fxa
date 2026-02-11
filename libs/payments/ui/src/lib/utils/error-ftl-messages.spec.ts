/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '@testing-library/jest-dom/extend-expect';
import {
  BASIC_ERROR,
  CouponErrorMessageType,
  getFallbackTextByFluentId,
} from './error-ftl-messages';

describe('getFallbackTextByFluentId', () => {
  it('returns default basic error message if no error id is provided', () => {
    expect(getFallbackTextByFluentId('')).toEqual(
      'Something went wrong. Please try again later.'
    );
  });

  it('returns default basic error message if provided error id does not match any key in dictionary', () => {
    expect(getFallbackTextByFluentId('foo-bar')).toEqual(
      'Something went wrong. Please try again later.'
    );
  });

  it('returns error message for provided error', () => {
    expect(getFallbackTextByFluentId(BASIC_ERROR)).toEqual(
      'Something went wrong. Please try again later.'
    );
  });

  it('returns coupon error message', () => {
    expect(getFallbackTextByFluentId(CouponErrorMessageType.Expired)).toEqual(
      'The code you entered has expired.'
    );
  });
});
