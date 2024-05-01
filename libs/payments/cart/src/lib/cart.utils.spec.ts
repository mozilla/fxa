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
      expect(result).toBe(CartErrorReasonId.Unknown);
    });

    it('should return for default', () => {
      mockStripeError.type = 'api_error';
      const result = stripeErrorToErrorReasonId(mockStripeError);
      expect(result).toBe(CartErrorReasonId.Unknown);
    });
  });
});
