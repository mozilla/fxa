/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';
import {
  FinishCart,
  FinishErrorCart,
  SetupCart,
  UpdateCart,
} from './cart.types';
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';

export class CartError extends BaseError {
  constructor(
    message: string,
    info: Record<string, any>,
    cause?: Error,
    name?: string
  ) {
    super(message, {
      name: name || 'CartError',
      cause,
      info,
    });
    this.name = 'CartError';
    Object.setPrototypeOf(this, CartError.prototype);
  }
}

export class CartNotCreatedError extends CartError {
  constructor(data: SetupCart, cause: Error) {
    super('Cart not created', data, cause);
    this.name = 'CartNotCreatedError';
    Object.setPrototypeOf(this, CartNotCreatedError.prototype);
  }
}

export class CartNotFoundError extends CartError {
  constructor(cartId: string, cause: Error) {
    super('Cart not found', { cartId }, cause);
    this.name = 'CartNotFoundError';
    Object.setPrototypeOf(this, CartNotFoundError.prototype);
  }
}

export class CartVersionMismatchError extends CartError {
  constructor(cartId: string) {
    super('Cart version mismatch', { cartId });
    this.name = 'CartVersionMismatchError';
    Object.setPrototypeOf(this, CartVersionMismatchError.prototype);
  }
}

export class CartNotUpdatedError extends CartError {
  constructor(
    cartId: string,
    data?: FinishCart | FinishErrorCart | UpdateCart,
    cause?: Error
  ) {
    super(
      'Cart not updated',
      {
        ...data,
        cartId,
      },
      cause
    );
    this.name = 'CartNotUpdatedError';
    Object.setPrototypeOf(this, CartNotUpdatedError.prototype);
  }
}

export class CartStateProcessingError extends CartError {
  constructor(cartId: string, cause: Error) {
    super('Cart state not changed to processing', { cartId }, cause);
    this.name = 'CartStateProcessingError';
    Object.setPrototypeOf(this, CartStateProcessingError.prototype);
  }
}

export class CartStateFinishedError extends CartError {
  constructor() {
    super('Cart state is already finished', {});
    this.name = 'CartStateFinishedError';
    Object.setPrototypeOf(this, CartStateFinishedError.prototype);
  }
}

export class CartNotDeletedError extends CartError {
  constructor(cartId: string, cause?: Error) {
    super('Cart not deleted', { cartId }, cause);
    this.name = 'CartNotDeletedError';
    Object.setPrototypeOf(this, CartNotDeletedError.prototype);
  }
}

export class CartNotRestartedError extends CartError {
  constructor(previousCartId: string, cause: Error) {
    super('Cart not created', { previousCartId }, cause);
    this.name = 'CartNotRestartedError';
    Object.setPrototypeOf(this, CartNotRestartedError.prototype);
  }
}

export class CartInvalidStateForActionError extends CartError {
  constructor(cartId: string, state: CartState, action: string) {
    super('Invalid state for executed action', {
      cartId,
      state,
      action,
    });
    this.name = 'CartInvalidStateForActionError';
    Object.setPrototypeOf(this, CartInvalidStateForActionError.prototype);
  }
}

export class CartTotalMismatchError extends CartError {
  constructor(cartId: string, cartAmount: number, invoiceAmount: number) {
    super('Cart total mismatch', { cartId, cartAmount, invoiceAmount });
    this.name = 'CartTotalMismatchError';
    Object.setPrototypeOf(this, CartTotalMismatchError.prototype);
  }
}

export class CartEligibilityMismatchError extends CartError {
  constructor(
    cartId: string,
    cartEligibility: CartEligibilityStatus,
    incomingEligibility: CartEligibilityStatus
  ) {
    super('Cart eligibility mismatch', {
      cartId,
      cartEligibility,
      incomingEligibility,
    });
    this.name = 'CartEligibilityMismatchError';
    Object.setPrototypeOf(this, CartEligibilityMismatchError.prototype);
  }
}

export class CartAccountNotFoundError extends CartError {
  constructor(cartId: string) {
    super('Cart account not found for uid', {
      cartId,
    });
    this.name = 'CartAccountNotFoundError';
    Object.setPrototypeOf(this, CartAccountNotFoundError.prototype);
  }
}

export class CartUidNotFoundError extends CartError {
  constructor(cartId: string) {
    super('Cart uid not found', {
      cartId,
    });
    this.name = 'CartUidNotFoundError';
    Object.setPrototypeOf(this, CartUidNotFoundError.prototype);
  }
}

export class CartInvalidPromoCodeError extends CartError {
  constructor(promoCode: string, cartId?: string) {
    super(
      'Cart specified promo code does not exist',
      {
        cartId,
        promoCode,
      },
      undefined,
      'CartInvalidPromoCodeError'
    );
    this.name = 'CartInvalidPromoCodeError';
    Object.setPrototypeOf(this, CartInvalidPromoCodeError.prototype);
  }
}

export class CartCurrencyNotFoundError extends CartError {
  constructor(
    currency: string | undefined,
    country: string | undefined,
    cartId?: string
  ) {
    super('Cart currency could not be determined', {
      cartId,
      currency,
      country,
    });
    this.name = 'CartCurrencyNotFoundError';
    Object.setPrototypeOf(this, CartCurrencyNotFoundError.prototype);
  }
}

export class CartNoTaxAddressError extends CartError {
  constructor(cartId: string) {
    super('Cart tax address not found', {
      cartId,
    });
    this.name = 'CartNoTaxAddressError';
    Object.setPrototypeOf(this, CartNoTaxAddressError.prototype);
  }
}

export class CartSubscriptionNotFoundError extends CartError {
  constructor(cartId: string) {
    super('Cart subscription not found', {
      cartId,
    });
    this.name = 'CartSubscriptionNotFoundError';
    Object.setPrototypeOf(this, CartSubscriptionNotFoundError.prototype);
  }
}
