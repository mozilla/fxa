/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Stripe } from 'stripe';
import {
  IntentCardDeclinedError,
  IntentCardExpiredError,
  IntentFailedGenericError,
  IntentGetInTouchError,
  IntentTryAgainError,
  IntentInsufficientFundsError,
} from '../checkout.error';

export function throwIntentFailedError(
  errorCode:
    | Stripe.PaymentIntent.LastPaymentError.Code
    | Stripe.SetupIntent.LastSetupError.Code
    | undefined,
  declineCode: string | undefined,
  cartId: string,
  paymentIntentId: string,
  intentType: 'SetupIntent' | 'PaymentIntent'
) {
  switch (errorCode) {
    case 'payment_intent_payment_attempt_failed':
    case 'payment_method_provider_decline':
    case 'card_declined': {
      switch (declineCode) {
        case 'approve_with_id':
        case 'issuer_not_available':
        case 'reenter_transaction':
          throw new IntentTryAgainError(cartId, paymentIntentId, intentType);
        case 'insufficient_funds':
          throw new IntentInsufficientFundsError(cartId, paymentIntentId, intentType);
        case 'call_issuer':
        case 'card_not_supported':
        case 'card_velocity_exceeded':
        case 'do_not_honor':
        case 'fraudulent':
        case 'generic_decline':
        case 'invalid_account':
        case 'lost_card':
        case 'merchant_blacklist':
        case 'new_account_information_available':
        case 'no_action_take':
        case 'not_permitted':
        case 'pickup_card':
        case 'restricted_card':
        case 'revocation_of_all_authorizations':
        case 'revocation_of_authorization':
        case 'security_violation':
        case 'service_not_allowed':
        case 'stolen_card':
        case 'stop_payment_order':
        case 'transaction_not_allowed':
          throw new IntentGetInTouchError(cartId, paymentIntentId, intentType);
        default:
          throw new IntentCardDeclinedError(
            cartId,
            paymentIntentId,
            intentType
          );
      }
    }
    case 'incorrect_cvc':
      throw new IntentCardDeclinedError(cartId, paymentIntentId, intentType);
    case 'expired_card':
      throw new IntentCardExpiredError(cartId, paymentIntentId, intentType);
    case 'payment_intent_authentication_failure':
    case 'setup_intent_authentication_failure':
    case 'processing_error':
      throw new IntentTryAgainError(cartId, paymentIntentId, intentType);
    default:
      throw new IntentFailedGenericError(
        cartId,
        paymentIntentId,
        '',
        intentType
      );
  }
}
