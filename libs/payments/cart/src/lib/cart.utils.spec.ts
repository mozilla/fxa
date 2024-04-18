import Stripe from 'stripe';
import { stripeErrorToErrorReasonId } from './cart.utils';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';

describe('utils', () => {
  describe('stripeErrorReasonId', () => {
    let mockStripeError: Stripe.StripeRawError;

    beforeEach(() => {
      mockStripeError = new Error() as unknown as Stripe.StripeRawError;
    });

    it('should return for type card_error', () => {
      mockStripeError.type = 'card_error';
      const result = stripeErrorToErrorReasonId(mockStripeError);
      expect(result).toBe(CartErrorReasonId.Unknown);
    });

    it('should return for default', () => {
      mockStripeError.type = 'invalid_grant';
      const result = stripeErrorToErrorReasonId(mockStripeError);
      expect(result).toBe(CartErrorReasonId.Unknown);
    });
  });
});
