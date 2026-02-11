/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CartState } from '@fxa/shared/db/mysql/account';
import { getRedirect, validateCartState } from './get-cart';
import { SupportedPages } from './types';

describe('getCart Utils', () => {
  describe('validateCartState', () => {
    it('should return true if state matches page', () => {
      const expected = true;
      const result = validateCartState(CartState.START, SupportedPages.START);
      expect(result).toBe(expected);
    });

    it('should return false if state does not match page', () => {
      const expected = false;
      const result = validateCartState(
        CartState.START,
        SupportedPages.PROCESSING
      );
      expect(result).toBe(expected);
    });
  });

  describe('getRedirect', () => {
    it('should return correct page for redirect', () => {
      const expected = SupportedPages.ERROR;
      const result = getRedirect(CartState.FAIL);
      expect(result).toBe(expected);
    });
  });
});
