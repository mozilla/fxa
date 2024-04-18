import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import { Stripe } from 'stripe';

export function stripeErrorToErrorReasonId(
  stripeError: Stripe.StripeRawError
): CartErrorReasonId {
  switch (stripeError.type) {
    case 'card_error':
    default:
      return CartErrorReasonId.Unknown;
  }
}
