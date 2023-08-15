/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { NotFoundError } from 'objection';
import { Cart, CartState } from '@fxa/shared/db/mysql/account';
import { Logger } from '@fxa/shared/log';
import {
  FinishCart,
  FinishErrorCart,
  SetupCart,
  UpdateCart,
} from './cart.types';
import {
  CartInvalidStateForActionError,
  CartNotCreatedError,
  CartNotDeletedError,
  CartNotFoundError,
  CartNotRestartedError,
  CartNotUpdatedError,
} from './cart.error';

// For an action to be executed, the cart state needs to be in one of
// valid states listed in the array of CartStates below
const ACTIONS_VALID_STATE = {
  updateFreshCart: [CartState.START],
  finishCart: [CartState.PROCESSING],
  finishErrorCart: [CartState.START, CartState.PROCESSING],
  deleteCart: [CartState.START, CartState.PROCESSING],
  restartCart: [CartState.START, CartState.PROCESSING, CartState.FAIL],
};

// Type guard to check if action is valid key in ACTIONS_VALID_STATE
const isAction = (action: string): action is keyof typeof ACTIONS_VALID_STATE =>
  action in ACTIONS_VALID_STATE;

export class CartManager {
  private log: Logger;
  constructor(log: Logger) {
    this.log = log;
  }

  private async handleUpdates(cart: Cart) {
    const updatedRows = await cart.update();
    if (!updatedRows) {
      throw new CartNotUpdatedError(cart.id);
    } else {
      return cart;
    }
  }

  /**
   * Ensure that the action being executed has a valid Cart state for
   * that action. For example, updateFreshCart is only allowed on carts
   * with state CartState.START.
   */
  private checkActionForValidCartState(cart: Cart, action: string) {
    const isValid =
      isAction(action) && ACTIONS_VALID_STATE[action].includes(cart.state);

    if (!isValid) {
      throw new CartInvalidStateForActionError(cart.id, cart.state, action);
    } else {
      return true;
    }
  }

  public async createCart(input: SetupCart) {
    try {
      return await Cart.create({
        ...input,
        state: CartState.START,
      });
    } catch (error) {
      throw new CartNotCreatedError(input, error);
    }
  }

  public async fetchCartById(id: string) {
    try {
      return await Cart.findById(id);
    } catch (error) {
      const cause = error instanceof NotFoundError ? undefined : error;
      throw new CartNotFoundError(id, cause);
    }
  }

  public async updateFreshCart(cart: Cart, items: UpdateCart) {
    this.checkActionForValidCartState(cart, 'updateFreshCart');

    cart.setCart({
      ...items,
    });

    try {
      return await this.handleUpdates(cart);
    } catch (error) {
      const cause = error instanceof CartNotUpdatedError ? undefined : error;
      throw new CartNotUpdatedError(cart.id, items, cause);
    }
  }

  public async finishCart(cart: Cart, items: FinishCart) {
    this.checkActionForValidCartState(cart, 'finishCart');

    cart.setCart({
      state: CartState.SUCCESS,
      ...items,
    });

    try {
      return await this.handleUpdates(cart);
    } catch (error) {
      const cause = error instanceof CartNotUpdatedError ? undefined : error;
      throw new CartNotUpdatedError(cart.id, items, cause);
    }
  }

  public async finishErrorCart(cart: Cart, items: FinishErrorCart) {
    this.checkActionForValidCartState(cart, 'finishErrorCart');

    cart.setCart({
      state: CartState.FAIL,
      ...items,
    });

    try {
      return await this.handleUpdates(cart);
    } catch (error) {
      const cause = error instanceof CartNotUpdatedError ? undefined : error;
      throw new CartNotUpdatedError(cart.id, items, cause);
    }
  }

  public async deleteCart(cart: Cart) {
    this.checkActionForValidCartState(cart, 'deleteCart');

    try {
      const result = await cart.delete();
      if (!result) {
        throw new CartNotDeletedError(cart.id);
      } else {
        return result;
      }
    } catch (error) {
      const cause = error instanceof CartNotDeletedError ? undefined : error;
      throw new CartNotDeletedError(cart.id, cause);
    }
  }

  public async restartCart(cart: Cart) {
    this.checkActionForValidCartState(cart, 'restartCart');

    try {
      return await Cart.create({
        ...cart,
        state: CartState.START,
      });
    } catch (error) {
      throw new CartNotRestartedError(cart.id, error);
    }
  }
}
