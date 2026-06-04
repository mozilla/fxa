/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { throwIntentFailedError } from './throwIntentFailedError';
import {
  IntentCardDeclinedError,
  IntentCardExpiredError,
  IntentFailedGenericError,
  IntentGetInTouchError,
  IntentInsufficientFundsError,
  IntentTryAgainError,
} from '../checkout.error';

const cartId = 'test-cart-id';
const paymentIntentId = 'test-intent-id';
const intentType = 'PaymentIntent' as const;

describe('throwIntentFailedError', () => {
  const declineCodeCases: [string, typeof Error][] = [
    ['approve_with_id', IntentTryAgainError],
    ['issuer_not_available', IntentTryAgainError],
    ['reenter_transaction', IntentTryAgainError],
    ['insufficient_funds', IntentInsufficientFundsError],
    ['call_issuer', IntentGetInTouchError],
    ['card_not_supported', IntentGetInTouchError],
    ['card_velocity_exceeded', IntentGetInTouchError],
    ['do_not_honor', IntentGetInTouchError],
    ['fraudulent', IntentGetInTouchError],
    ['generic_decline', IntentGetInTouchError],
    ['invalid_account', IntentGetInTouchError],
    ['lost_card', IntentGetInTouchError],
    ['merchant_blacklist', IntentGetInTouchError],
    ['new_account_information_available', IntentGetInTouchError],
    ['no_action_take', IntentGetInTouchError],
    ['not_permitted', IntentGetInTouchError],
    ['pickup_card', IntentGetInTouchError],
    ['restricted_card', IntentGetInTouchError],
    ['revocation_of_all_authorizations', IntentGetInTouchError],
    ['revocation_of_authorization', IntentGetInTouchError],
    ['security_violation', IntentGetInTouchError],
    ['service_not_allowed', IntentGetInTouchError],
    ['stolen_card', IntentGetInTouchError],
    ['stop_payment_order', IntentGetInTouchError],
    ['transaction_not_allowed', IntentGetInTouchError],
    ['unexpected_code', IntentCardDeclinedError],
  ];

  test.each(declineCodeCases)(
    'returns correct error class for card_declined with decline_code=%s',
    (declineCode, ExpectedError) => {
      expect(() =>
        throwIntentFailedError(
          'card_declined',
          declineCode,
          cartId,
          paymentIntentId,
          intentType
        )
      ).toThrow(ExpectedError);
    }
  );

  test.each(declineCodeCases)(
    'returns correct error class for payment_intent_payment_attempt_failed with decline_code=%s',
    (declineCode, ExpectedError) => {
      expect(() =>
        throwIntentFailedError(
          'payment_intent_payment_attempt_failed' as any,
          declineCode,
          cartId,
          paymentIntentId,
          intentType
        )
      ).toThrow(ExpectedError);
    }
  );

  test.each(declineCodeCases)(
    'returns correct error class for payment_method_provider_decline with decline_code=%s',
    (declineCode, ExpectedError) => {
      expect(() =>
        throwIntentFailedError(
          'payment_method_provider_decline' as any,
          declineCode,
          cartId,
          paymentIntentId,
          intentType
        )
      ).toThrow(ExpectedError);
    }
  );

  test.each(['incorrect_cvc', 'incorrect_number', 'incorrect_zip', 'invalid_cvc'])(
    'returns IntentCardDeclinedError for %s',
    (errorCode) => {
      expect(() =>
        throwIntentFailedError(
          errorCode as any,
          undefined,
          cartId,
          paymentIntentId,
          intentType
        )
      ).toThrow(IntentCardDeclinedError);
    }
  );

  it('returns IntentCardExpiredError for expired_card', () => {
    expect(() =>
      throwIntentFailedError(
        'expired_card',
        undefined,
        cartId,
        paymentIntentId,
        intentType
      )
    ).toThrow(IntentCardExpiredError);
  });

  test.each([
    'payment_intent_authentication_failure',
    'setup_intent_authentication_failure',
    'processing_error',
  ])('returns IntentTryAgainError for %s', (errorCode) => {
    expect(() =>
      throwIntentFailedError(
        errorCode as any,
        undefined,
        cartId,
        paymentIntentId,
        intentType
      )
    ).toThrow(IntentTryAgainError);
  });

  it('returns IntentFailedGenericError for undefined error code', () => {
    expect(() =>
      throwIntentFailedError(
        undefined,
        undefined,
        cartId,
        paymentIntentId,
        intentType
      )
    ).toThrow(IntentFailedGenericError);
  });

  it('returns IntentFailedGenericError for unknown error code', () => {
    expect(() =>
      throwIntentFailedError(
        'unknown_code' as any,
        undefined,
        cartId,
        paymentIntentId,
        intentType
      )
    ).toThrow(IntentFailedGenericError);
  });
});
