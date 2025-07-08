/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import {
  CartCurrencyNotFoundError,
  CartStateProcessingError,
  CartTotalMismatchError,
} from '../cart.error';
import {
  CheckoutError,
  IntentCardDeclinedError,
  IntentCardExpiredError,
  IntentFailedGenericError,
  IntentGetInTouchError,
  IntentTryAgainError,
  IntentInsufficientFundsError,
} from '../checkout.error';
import { BaseError } from '@fxa/shared/error';

export function resolveErrorInstance(error: Error) {
  /**
   * Handle specific errors here. Typically this is necessary
   * when the CartErrorReasonId has a corresponding frontend error
   * message.
   */
  switch (true) {
    // Cart Errors
    case error instanceof CartCurrencyNotFoundError:
      return CartErrorReasonId.CART_CURRENCY_NOT_DETERMINED;
    case error instanceof CartStateProcessingError:
      return CartErrorReasonId.CART_PROCESSING_GENERAL_ERROR;
    case error instanceof CartTotalMismatchError:
      return CartErrorReasonId.CART_TOTAL_MISMATCH;

    // Payment failed errors
    case error instanceof IntentCardDeclinedError:
      return CartErrorReasonId.INTENT_FAILED_CARD_DECLINED;
    case error instanceof IntentCardExpiredError:
      return CartErrorReasonId.INTENT_FAILED_CARD_EXPIRED;
    case error instanceof IntentTryAgainError:
      return CartErrorReasonId.INTENT_FAILED_TRY_AGAIN;
    case error instanceof IntentGetInTouchError:
      return CartErrorReasonId.INTENT_FAILED_GET_IN_TOUCH;
    case error instanceof IntentFailedGenericError:
      return CartErrorReasonId.INTENT_FAILED_GENERIC;
    case error instanceof IntentInsufficientFundsError:
      return CartErrorReasonId.INTENT_FAILED_INSUFFICIENT_FUNDS;

    // Checkout Errors
    case error instanceof CheckoutError:
      return CartErrorReasonId.BASIC_ERROR;

    // Eligibility Errors
  }

  /**
   * Handle libs parent errors.
   * Most should inherit from BaseError. Add any other values as necessary.
   * Note, these return values do not map to a frontend error message.
   * However, they can be useful for logging and debugging.
   */
  switch (true) {
    case error instanceof BaseError:
      return error.constructor.name;
  }

  return CartErrorReasonId.UNKNOWN;
}
