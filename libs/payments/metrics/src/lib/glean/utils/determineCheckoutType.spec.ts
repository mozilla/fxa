/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { determineCheckoutType } from './determineCheckoutType';

describe('determineCheckoutType', () => {
  it('should return new_account if isNewAccount is true', () => {
    expect(determineCheckoutType('true', 'true')).toEqual('new_account');
  });

  it('should return existing_account if uid provided but isNewAccount is not', () => {
    expect(determineCheckoutType('true')).toEqual('existing_account');
  });

  it('should return logged_out if both isNewAccount and uid are empty', () => {
    expect(determineCheckoutType('')).toEqual('logged_out');
  });
});
