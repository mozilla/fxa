/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { NotFoundError } from 'objection';
import { v4 as uuidv4 } from 'uuid';

import { AccountDbProvider, CartState } from '@fxa/shared/db/mysql/account';
import { Inject, Injectable } from '@nestjs/common';

import {
  CartInvalidStateForActionError,
  CartNotCreatedError,
  CartNotDeletedError,
  CartNotFoundError,
  CartNotUpdatedError,
  CartVersionMismatchError,
} from './cart.error';
import {
  createCart,
  deleteCart,
  fetchCartById,
  updateCart,
} from './cart.repository';
import {
  FinishCart,
  FinishErrorCart,
  ResultCart,
  SetupCart,
  UpdateCart,
} from './cart.types';

import type { AccountDatabase } from '@fxa/shared/db/mysql/account';
// For an action to be executed, the cart state needs to be in one of
// valid states listed in the array of CartStates below
const ACTIONS_VALID_STATE = {
  updateFreshCart: [CartState.START, CartState.PROCESSING],
  finishCart: [CartState.PROCESSING],
  finishErrorCart: [CartState.START, CartState.PROCESSING],
  deleteCart: [CartState.START, CartState.PROCESSING],
  restartCart: [CartState.START, CartState.PROCESSING, CartState.FAIL],
  setProcessingCart: [CartState.START],
};

// Type guard to check if action is valid key in ACTIONS_VALID_STATE
const isAction = (action: string): action is keyof typeof ACTIONS_VALID_STATE =>
  action in ACTIONS_VALID_STATE;

@Injectable()
export class CartManager {
  constructor(@Inject(AccountDbProvider) private db: AccountDatabase) {}

  /**
   * Ensure that the action being executed has a valid Cart state for
   * that action. For example, updateFreshCart is only allowed on carts
   * with state CartState.START.
   */
  private checkActionForValidCartState(
    cart: ResultCart,
    action: keyof typeof ACTIONS_VALID_STATE
  ) {
    const isValid =
      isAction(action) && ACTIONS_VALID_STATE[action].includes(cart.state);

    if (!isValid) {
      throw new CartInvalidStateForActionError(cart.id, cart.state, action);
    } else {
      return true;
    }
  }

  /**
   * Fetch a cart from the database by id and validate that the version
   * matches the version passed in.
   */
  async fetchAndValidateCartVersion(cartId: string, version: number) {
    const cart = await this.fetchCartById(cartId);

    if (cart.version !== version) {
      throw new CartVersionMismatchError(cartId);
    }

    return cart;
  }

  public async createCart(input: SetupCart): Promise<ResultCart> {
    const now = Date.now();
    try {
      const cart = await createCart(this.db, {
        ...input,
        taxAddress: input.taxAddress
          ? JSON.stringify(input.taxAddress)
          : undefined,
        currency: input.currency,
        id: uuidv4({}, Buffer.alloc(16)),
        uid: input.uid ? Buffer.from(input.uid, 'hex') : undefined,
        state: CartState.START,
        createdAt: now,
        updatedAt: now,
        version: 0,
      });
      return {
        ...cart,
        id: cart.id.toString('hex'),
        uid: cart.uid ? cart.uid.toString('hex') : undefined,
      };
    } catch (error) {
      console.log(error);
      throw new CartNotCreatedError(input, error);
    }
  }

  public async fetchCartById(id: string): Promise<ResultCart> {
    try {
      const cart = await fetchCartById(this.db, Buffer.from(id, 'hex'));
      return {
        ...cart,
        id: cart.id.toString('hex'),
        uid: cart.uid ? cart.uid.toString('hex') : undefined,
      };
    } catch (error) {
      const cause = error instanceof NotFoundError ? undefined : error;
      throw new CartNotFoundError(id, cause);
    }
  }

  public async updateFreshCart(
    cartId: string,
    version: number,
    items: UpdateCart
  ) {
    const cart = await this.fetchAndValidateCartVersion(cartId, version);

    this.checkActionForValidCartState(cart, 'updateFreshCart');

    try {
      await updateCart(this.db, Buffer.from(cartId, 'hex'), version, {
        ...items,
        taxAddress: items.taxAddress
          ? JSON.stringify(items.taxAddress)
          : undefined,
        currency: items.currency,
        uid: items.uid ? Buffer.from(items.uid, 'hex') : undefined,
      });
    } catch (error) {
      const cause = error instanceof CartNotUpdatedError ? undefined : error;
      throw new CartNotUpdatedError(cart.id, items, cause);
    }
  }

  public async finishCart(cartId: string, version: number, items: FinishCart) {
    const cart = await this.fetchAndValidateCartVersion(cartId, version);

    this.checkActionForValidCartState(cart, 'finishCart');

    try {
      await updateCart(this.db, Buffer.from(cartId, 'hex'), version, {
        ...items,
        uid: items.uid ? Buffer.from(items.uid, 'hex') : undefined,
        state: CartState.SUCCESS,
      });
    } catch (error) {
      const cause = error instanceof CartNotUpdatedError ? undefined : error;
      throw new CartNotUpdatedError(cartId, items, cause);
    }
  }

  public async finishErrorCart(cartId: string, items: FinishErrorCart) {
    const cart = await this.fetchCartById(cartId);

    this.checkActionForValidCartState(cart, 'finishErrorCart');

    try {
      await updateCart(this.db, Buffer.from(cartId, 'hex'), cart.version, {
        ...items,
        uid: items.uid ? Buffer.from(items.uid, 'hex') : undefined,
        state: CartState.FAIL,
      });
    } catch (error) {
      const cause = error instanceof CartNotUpdatedError ? undefined : error;
      throw new CartNotUpdatedError(cartId, items, cause);
    }
  }

  public async setProcessingCart(cartId: string) {
    const cart = await this.fetchCartById(cartId);

    this.checkActionForValidCartState(cart, 'setProcessingCart');

    try {
      await updateCart(this.db, Buffer.from(cartId, 'hex'), cart.version, {
        state: CartState.PROCESSING,
      });
    } catch (error) {
      const cause = error instanceof CartNotUpdatedError ? undefined : error;
      throw new CartNotUpdatedError(cartId, cause);
    }
  }

  public async deleteCart(cart: ResultCart) {
    this.checkActionForValidCartState(cart, 'deleteCart');

    try {
      if (!(await deleteCart(this.db, cart))) {
        throw new CartNotDeletedError(cart.id);
      }
      return true;
    } catch (error) {
      const cause = error instanceof CartNotDeletedError ? undefined : error;
      throw new CartNotDeletedError(cart.id, cause);
    }
  }
}
