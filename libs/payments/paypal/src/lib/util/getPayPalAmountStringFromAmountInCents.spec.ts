/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AmountExceedsPayPalCharLimitError } from '../paypal.error';
import { getPayPalAmountStringFromAmountInCents } from './getPayPalAmountStringFromAmountInCents';

describe('getPayPalAmountStringFromAmountInCents', () => {
  it('returns correctly formatted string', () => {
    const amountInCents = 9999999999;
    const expectedResult = (amountInCents / 100).toFixed(2);

    const result = getPayPalAmountStringFromAmountInCents(amountInCents);

    expect(result).toEqual(expectedResult);
  });

  it('throws an error if number exceeds digit limit', () => {
    const amountInCents = 12345678910;

    expect(() => {
      getPayPalAmountStringFromAmountInCents(amountInCents);
    }).toThrow(AmountExceedsPayPalCharLimitError);
  });
});
