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
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, {
      name: 'CartError',
      cause,
      info,
    });
  }
}

export class CartNotCreatedError extends CartError {
  constructor(data: SetupCart, cause: Error) {
    super('Cart not created', data, cause);
  }
}

export class CartNotFoundError extends CartError {
  constructor(cartId: string, cause: Error) {
    super('Cart not found', { cartId }, cause);
  }
}

export class CartVersionMismatchError extends CartError {
  constructor(cartId: string) {
    super('Cart version mismatch', { cartId });
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
  }
}

export class CartStateFinishedError extends CartError {
  constructor() {
    super('Cart state is already finished', {});
  }
}

export class CartNotDeletedError extends CartError {
  constructor(cartId: string, cause?: Error) {
    super('Cart not deleted', { cartId }, cause);
  }
}

export class CartNotRestartedError extends CartError {
  constructor(previousCartId: string, cause: Error) {
    super('Cart not created', { previousCartId }, cause);
  }
}

export class CartInvalidStateForActionError extends CartError {
  constructor(cartId: string, state: CartState, action: string) {
    super('Invalid state for executed action', {
      cartId,
      state,
      action,
    });
  }
}

export class CartTotalMismatchError extends CartError {
  constructor(cartId: string, cartAmount: number, invoiceAmount: number) {
    super('Cart total mismatch', { cartId, cartAmount, invoiceAmount });
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
  }
}

export class CartEmailNotFoundError extends CartError {
  constructor(cartId: string) {
    super('Cart email not found', {
      cartId,
    });
  }
}

export class CartInvalidPromoCodeError extends CartError {
  constructor(promoCode: string, cartId?: string) {
    super('Cart specified promo code does not exist', {
      cartId,
      promoCode,
    });
  }
}

export class CartInvalidCurrencyError extends CartError {
  constructor(
    currency: string | undefined,
    country: string | undefined,
    cartId?: string
  ) {
    super('Cart specified currency is not supported', {
      cartId,
      currency,
      country,
    });
  }
}
