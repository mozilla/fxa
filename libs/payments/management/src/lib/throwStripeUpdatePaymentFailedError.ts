/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Stripe } from 'stripe';
import {
  ManagePaymentMethodIntentCardDeclinedError,
  ManagePaymentMethodIntentCardExpiredError,
  ManagePaymentMethodIntentFailedGenericError,
  ManagePaymentMethodIntentGetInTouchError,
  ManagePaymentMethodIntentTryAgainError,
  ManagePaymentMethodIntentInsufficientFundsError,
} from './manage-payment-method.error';

export function throwStripeUpdatePaymentFailedError(
  errorCode:
    | Stripe.PaymentIntent.LastPaymentError.Code
    | Stripe.SetupIntent.LastSetupError.Code
    | undefined,
  declineCode: string | undefined,
) {
  switch (errorCode) {
    case 'payment_intent_payment_attempt_failed':
    case 'payment_method_provider_decline':
    case 'card_declined': {
      switch (declineCode) {
        case 'approve_with_id':
        case 'issuer_not_available':
        case 'reenter_transaction':
          throw new ManagePaymentMethodIntentTryAgainError('intent_failed_try_again');
        case 'insufficient_funds':
          throw new ManagePaymentMethodIntentInsufficientFundsError('intent_failed_insufficient_funds');
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
          throw new ManagePaymentMethodIntentGetInTouchError('intent_failed_get_in_touch');
        default:
          throw new ManagePaymentMethodIntentCardDeclinedError('intent_failed_card_declined');
      }
    }
    case 'incorrect_cvc':
      throw new ManagePaymentMethodIntentCardDeclinedError('intent_failed_card_declined');
    case 'expired_card':
      throw new ManagePaymentMethodIntentCardExpiredError('intent_failed_card_expired');
    case 'payment_intent_authentication_failure':
    case 'setup_intent_authentication_failure':
    case 'processing_error':
      throw new ManagePaymentMethodIntentTryAgainError('intent_failed_try_again');
    default:
      throw new ManagePaymentMethodIntentFailedGenericError('intent_failed_generic');
  }
}
