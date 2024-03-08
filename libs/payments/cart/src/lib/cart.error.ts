import { BaseError } from '@fxa/shared/error';
import {
  FinishCart,
  FinishErrorCart,
  SetupCart,
  UpdateCart,
} from './cart.types';
import { CartState } from '@fxa/shared/db/mysql/account';

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
