/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import {
  CartCurrencyNotFoundError,
  CartStateProcessingError,
} from '../cart.error';
import { CheckoutFailedError } from '../checkout.error';
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

    // Checkout Errors
    case error instanceof CheckoutFailedError:
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
