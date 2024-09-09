/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getMinimumChargeAmountForCurrency } from './getMinimumChargeAmountForCurrency';

describe('getMinimumChargeAmountForCurrency', () => {
  it('returns minimum amout for valid currency', () => {
    const expected = 50;
    const result = getMinimumChargeAmountForCurrency('usd');

    expect(result).toEqual(expected);
  });

  it('throws an error if currency is invalid', () => {
    expect(() => getMinimumChargeAmountForCurrency('fake')).toThrow(
      'Currency does not have a minimum charge amount available.'
    );
  });
});
