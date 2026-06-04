/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import { BaseError } from '@fxa/shared/error';
import {
  PayPalError,
  PayPalActiveSubscriptionsMissingAgreementError,
} from '@fxa/payments/paypal';

import { resolveErrorInstance } from './resolveErrorInstance';
import {
  CartCurrencyNotFoundError,
  CartFreeTrialMismatchError,
  CartStateProcessingError,
  CartTotalMismatchError,
} from '../cart.error';
import {
  CheckoutError,
  IntentCardDeclinedError,
  IntentCardExpiredError,
  IntentFailedGenericError,
  IntentGetInTouchError,
  IntentInsufficientFundsError,
  IntentTryAgainError,
  NewAccountPrepaidCardFreeTrialNotAllowedError,
} from '../checkout.error';

const cartId = 'cart-123';
const intentId = 'pi_abc';
const intentType = 'PaymentIntent' as const;

describe('resolveErrorInstance', () => {
  describe('cart errors', () => {
    it.each([
      [
        'CartCurrencyNotFoundError',
        new CartCurrencyNotFoundError('currency not found', 'usd', 'US', cartId),
        CartErrorReasonId.CART_CURRENCY_NOT_DETERMINED,
      ],
      [
        'CartStateProcessingError',
        new CartStateProcessingError('processing error', cartId, new Error('cause')),
        CartErrorReasonId.CART_PROCESSING_GENERAL_ERROR,
      ],
      [
        'CartTotalMismatchError',
        new CartTotalMismatchError(cartId, 500, 1000),
        CartErrorReasonId.CART_TOTAL_MISMATCH,
      ],
      [
        'CartFreeTrialMismatchError',
        new CartFreeTrialMismatchError(cartId, true, false),
        CartErrorReasonId.CART_FREE_TRIAL_ELIGIBILITY_MISMATCH,
      ],
    ])('returns correct reason for %s', (_name, error, expected) => {
      expect(resolveErrorInstance(error)).toBe(expected);
    });
  });

  describe('intent payment failed errors', () => {
    it.each([
      [
        'IntentCardDeclinedError',
        new IntentCardDeclinedError(cartId, intentId, intentType),
        CartErrorReasonId.INTENT_FAILED_CARD_DECLINED,
      ],
      [
        'IntentCardExpiredError',
        new IntentCardExpiredError(cartId, intentId, intentType),
        CartErrorReasonId.INTENT_FAILED_CARD_EXPIRED,
      ],
      [
        'IntentTryAgainError',
        new IntentTryAgainError(cartId, intentId, intentType),
        CartErrorReasonId.INTENT_FAILED_TRY_AGAIN,
      ],
      [
        'IntentGetInTouchError',
        new IntentGetInTouchError(cartId, intentId, intentType),
        CartErrorReasonId.INTENT_FAILED_GET_IN_TOUCH,
      ],
      [
        'IntentFailedGenericError',
        new IntentFailedGenericError(cartId, intentId, 'requires_payment_method', intentType),
        CartErrorReasonId.INTENT_FAILED_GENERIC,
      ],
      [
        'IntentInsufficientFundsError',
        new IntentInsufficientFundsError(cartId, intentId, intentType),
        CartErrorReasonId.INTENT_FAILED_INSUFFICIENT_FUNDS,
      ],
    ])('returns correct reason for %s', (_name, error, expected) => {
      expect(resolveErrorInstance(error)).toBe(expected);
    });
  });

  describe('PayPal errors', () => {
    it('returns PAYPAL_ACTIVE_SUBSCRIPTION_NO_BILLING_AGREEMENT for PayPalActiveSubscriptionsMissingAgreementError', () => {
      const error = new PayPalActiveSubscriptionsMissingAgreementError('uid-123');
      expect(resolveErrorInstance(error)).toBe(
        CartErrorReasonId.PAYPAL_ACTIVE_SUBSCRIPTION_NO_BILLING_AGREEMENT
      );
    });

    it('returns GENERAL_PAYPAL_ERROR for generic PayPalError', () => {
      const error = new PayPalError('something went wrong', { uid: 'uid-123' });
      expect(resolveErrorInstance(error)).toBe(
        CartErrorReasonId.GENERAL_PAYPAL_ERROR
      );
    });
  });

  describe('checkout errors', () => {
    it('returns NEW_ACCOUNT_PREPAID_CARD_FREE_TRIAL_NOT_ALLOWED for prepaid card error', () => {
      const error = new NewAccountPrepaidCardFreeTrialNotAllowedError(cartId, 'uid-123');
      expect(resolveErrorInstance(error)).toBe(
        CartErrorReasonId.NEW_ACCOUNT_PREPAID_CARD_FREE_TRIAL_NOT_ALLOWED
      );
    });

    it('returns BASIC_ERROR for generic CheckoutError', () => {
      const error = new CheckoutError('generic checkout failure', { cartId });
      expect(resolveErrorInstance(error)).toBe(CartErrorReasonId.BASIC_ERROR);
    });
  });

  describe('fallback handling', () => {
    it('returns the error class name for BaseError subclasses not in the switch', () => {
      class CustomBaseError extends BaseError {
        constructor() {
          super('custom error', {});
        }
      }
      const error = new CustomBaseError();
      expect(resolveErrorInstance(error)).toBe('CustomBaseError');
    });

    it('returns UNKNOWN for plain Error instances', () => {
      expect(resolveErrorInstance(new Error('plain error'))).toBe(
        CartErrorReasonId.UNKNOWN
      );
    });

    it('returns UNKNOWN for TypeError', () => {
      expect(resolveErrorInstance(new TypeError('type error'))).toBe(
        CartErrorReasonId.UNKNOWN
      );
    });
  });

  describe('specificity: more specific errors match before their parents', () => {
    it('IntentCardDeclinedError matches before CheckoutError', () => {
      const error = new IntentCardDeclinedError(cartId, intentId, intentType);
      expect(resolveErrorInstance(error)).toBe(
        CartErrorReasonId.INTENT_FAILED_CARD_DECLINED
      );
    });

    it('PayPalActiveSubscriptionsMissingAgreementError matches before PayPalError', () => {
      const error = new PayPalActiveSubscriptionsMissingAgreementError('uid-123');
      expect(resolveErrorInstance(error)).toBe(
        CartErrorReasonId.PAYPAL_ACTIVE_SUBSCRIPTION_NO_BILLING_AGREEMENT
      );
    });
  });
});
