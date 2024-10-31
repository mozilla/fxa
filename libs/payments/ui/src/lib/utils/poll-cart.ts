import { SupportedPages } from './types';
import type { Stripe } from '@stripe/stripe-js';
import {
  pollCartAction,
  finalizeProcessingCartAction,
  finalizeCartWithError,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/actions';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account/kysely-types';

export const pollCart = async (
  checkoutParams: {
    cartId: string;
    locale: string;
    interval: string;
    offeringId: string;
  },
  retries = 0,
  stripeClient: Stripe | null
): Promise<number> => {
  const pollCartResponse = await pollCartAction(checkoutParams.cartId);

  if (pollCartResponse.cartState !== 'processing') {
    await getCartOrRedirectAction(
      checkoutParams.cartId,
      SupportedPages.PROCESSING
    );
  } else if (
    pollCartResponse.cartState === 'processing' &&
    pollCartResponse.stripeClientSecret
  ) {
    // Handle next action and restart the polling process
    if (!stripeClient) {
      return retries + 1;
    }
    const { error, paymentIntent } = await stripeClient.handleNextAction({
      clientSecret: pollCartResponse.stripeClientSecret,
    });
    if (error || !paymentIntent) {
      await finalizeCartWithError(
        checkoutParams.cartId,
        CartErrorReasonId.BASIC_ERROR
      );
    } else {
      if (paymentIntent.status === 'succeeded') {
        await finalizeProcessingCartAction(checkoutParams.cartId);
      } else if (
        paymentIntent.status === 'canceled' ||
        paymentIntent.status === 'requires_payment_method'
      ) {
        await finalizeCartWithError(
          checkoutParams.cartId,
          CartErrorReasonId.BASIC_ERROR
        );
      } else {
        // TODO: handle other paymentIntent statuses. For now, retry
        retries += 1;
      }
      getCartOrRedirectAction(checkoutParams.cartId, SupportedPages.PROCESSING);
      return retries;
    }
  }

  getCartOrRedirectAction(checkoutParams.cartId, SupportedPages.PROCESSING),
    (retries += 1);
  return retries;
};
