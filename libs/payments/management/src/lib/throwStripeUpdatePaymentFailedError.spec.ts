/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ManagePaymentMethodIntentCardDeclinedError,
  ManagePaymentMethodIntentCardExpiredError,
  ManagePaymentMethodIntentFailedGenericError,
  ManagePaymentMethodIntentGetInTouchError,
  ManagePaymentMethodIntentTryAgainError,
  ManagePaymentMethodIntentInsufficientFundsError,
} from './manage-payment-method.error';
import {
  throwStripeUpdatePaymentFailedError
} from './throwStripeUpdatePaymentFailedError';

describe('throwStripeUpdatePaymentFailedError', () => {
  test.each([
    ['approve_with_id', ManagePaymentMethodIntentTryAgainError],
    ['issuer_not_available', ManagePaymentMethodIntentTryAgainError],
    ['reenter_transaction', ManagePaymentMethodIntentTryAgainError],
    ['insufficient_funds', ManagePaymentMethodIntentInsufficientFundsError],
    ['call_issuer', ManagePaymentMethodIntentGetInTouchError],
    ['card_not_supported', ManagePaymentMethodIntentGetInTouchError],
    ['card_velocity_exceeded', ManagePaymentMethodIntentGetInTouchError],
    ['do_not_honor', ManagePaymentMethodIntentGetInTouchError],
    ['fraudulent', ManagePaymentMethodIntentGetInTouchError],
    ['generic_decline', ManagePaymentMethodIntentGetInTouchError],
    ['invalid_account', ManagePaymentMethodIntentGetInTouchError],
    ['lost_card', ManagePaymentMethodIntentGetInTouchError],
    ['merchant_blacklist', ManagePaymentMethodIntentGetInTouchError],
    ['new_account_information_available', ManagePaymentMethodIntentGetInTouchError],
    ['no_action_take', ManagePaymentMethodIntentGetInTouchError],
    ['not_permitted', ManagePaymentMethodIntentGetInTouchError],
    ['pickup_card', ManagePaymentMethodIntentGetInTouchError],
    ['restricted_card', ManagePaymentMethodIntentGetInTouchError],
    ['revocation_of_all_authorizations', ManagePaymentMethodIntentGetInTouchError],
    ['revocation_of_authorization', ManagePaymentMethodIntentGetInTouchError],
    ['security_violation', ManagePaymentMethodIntentGetInTouchError],
    ['service_not_allowed', ManagePaymentMethodIntentGetInTouchError],
    ['stolen_card', ManagePaymentMethodIntentGetInTouchError],
    ['stop_payment_order', ManagePaymentMethodIntentGetInTouchError],
    ['transaction_not_allowed', ManagePaymentMethodIntentGetInTouchError],
    ['unexpected_code', ManagePaymentMethodIntentCardDeclinedError],
  ])(
    'throws correct error for card_declined with decline_code=%s',
    (declineCode, ExpectedError) => {
      expect(() =>
        throwStripeUpdatePaymentFailedError('card_declined', declineCode)
      ).toThrow(ExpectedError);
    }
  );

  it('throws ManagePaymentMethodIntentCardDeclinedError for incorrect_cvc', () => {
    expect(() =>
      throwStripeUpdatePaymentFailedError('incorrect_cvc', undefined)
    ).toThrow(ManagePaymentMethodIntentCardDeclinedError);
  });

  it('throws ManagePaymentMethodIntentCardExpiredError for expired_card', () => {
    expect(() =>
      throwStripeUpdatePaymentFailedError('expired_card', undefined)
    ).toThrow(ManagePaymentMethodIntentCardExpiredError);
  });

  test.each([
    'payment_intent_authentication_failure',
    'setup_intent_authentication_failure',
    'processing_error',
  ])('throws ManagePaymentMethodIntentTryAgainError for %s', (errorCode) => {
    expect(() =>
      throwStripeUpdatePaymentFailedError(errorCode as any, undefined)
    ).toThrow(ManagePaymentMethodIntentTryAgainError);
  });

  it('throws ManagePaymentMethodIntentFailedGenericError for undefined error code', () => {
    expect(() =>
      throwStripeUpdatePaymentFailedError(undefined, undefined)
    ).toThrow(ManagePaymentMethodIntentFailedGenericError);
  });

  it('throws ManagePaymentMethodIntentFailedGenericError for unknown error code', () => {
    expect(() =>
      throwStripeUpdatePaymentFailedError('unknown_code' as any, undefined)
    ).toThrow(ManagePaymentMethodIntentFailedGenericError);
  });
});
