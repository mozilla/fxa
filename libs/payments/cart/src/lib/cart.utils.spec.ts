/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { StripeError } from '@stripe/stripe-js';
import { stripeErrorToErrorReasonId } from './cart.utils';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';

describe('utils', () => {
  describe('stripeErrorReasonId', () => {
    let mockStripeError: StripeError;

    beforeEach(() => {
      mockStripeError = new Error() as unknown as StripeError;
    });

    it('should return for type card_error', () => {
      mockStripeError.type = 'card_error';
      const result = stripeErrorToErrorReasonId(mockStripeError);
      expect(result).toBe(CartErrorReasonId.UNKNOWN);
    });

    it('should return for default', () => {
      mockStripeError.type = 'api_error';
      const result = stripeErrorToErrorReasonId(mockStripeError);
      expect(result).toBe(CartErrorReasonId.UNKNOWN);
    });
  });
});
