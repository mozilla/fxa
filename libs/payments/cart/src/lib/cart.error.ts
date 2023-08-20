import { BaseError } from '@fxa/shared/error';
import {
  FinishCart,
  FinishErrorCart,
  SetupCart,
  UpdateCart,
} from './cart.types';
import { CartState } from '@fxa/shared/db/mysql/account';

export class CartError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(
      {
        ...(cause && { cause }),
      },
      message
    );
    this.name = this.constructor.name;
  }
}

// TODO - Add information about the cart that caused the errors

export class CartNotCreatedError extends CartError {
  data: SetupCart;
  constructor(data: SetupCart, cause: Error) {
    super('Cart not created', cause);
    this.data = data;
  }
}
export class CartNotFoundError extends CartError {
  cartId: string;
  constructor(cartId: string, cause: Error) {
    super('Cart not found', cause);
    this.cartId = cartId;
  }
}
export class CartNotUpdatedError extends CartError {
  cartId: string;
  data?: FinishCart | FinishErrorCart | UpdateCart;
  constructor(
    cartId: string,
    data?: FinishCart | FinishErrorCart | UpdateCart,
    cause?: Error
  ) {
    super('Cart not updated', cause);
    this.cartId = cartId;
    this.data = data;
  }
}
export class CartStateFinishedError extends CartError {
  constructor() {
    super('Cart state is already finished');
  }
}
export class CartNotDeletedError extends CartError {
  cartId: string;
  constructor(cartId: string, cause?: Error) {
    super('Cart not deleted', cause);
    this.cartId = cartId;
  }
}
export class CartNotRestartedError extends CartError {
  previousCartId: string;
  constructor(previousCartId: string, cause: Error) {
    super('Cart not created', cause);
    this.previousCartId = previousCartId;
  }
}

export class CartInvalidStateForActionError extends CartError {
  cartId: string;
  state: CartState;
  action: string;
  constructor(cartId: string, state: CartState, action: string) {
    super('Invalid state for executed action');
    this.cartId = cartId;
    this.state = state;
    this.action = action;
  }
}
