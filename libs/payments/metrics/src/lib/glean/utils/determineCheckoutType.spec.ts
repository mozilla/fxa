/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { determineCheckoutType } from './determineCheckoutType';

describe('determineCheckoutType', () => {
  it('should return with-accounts if uid provided', () => {
    expect(determineCheckoutType('validuid')).toEqual('with-accounts');
  });

  it('should return without-accounts if empty uid', () => {
    expect(determineCheckoutType('')).toEqual('without-accounts');
  });

  it('should return without-accounts if undefined uid', () => {
    expect(determineCheckoutType(undefined)).toEqual('without-accounts');
  });
});
