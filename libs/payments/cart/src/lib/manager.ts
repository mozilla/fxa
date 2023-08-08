/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { NotFoundError } from 'objection';
import { Cart, CartState } from '@fxa/shared/db/mysql/account';
import { Logger } from '@fxa/shared/log';
import { InvoiceFactory } from './factories';
import { Cart as CartType, SetupCart, UpdateCart } from './types';

const DEFAULT_INTERVAL = 'monthly';

// TODO - Adopt error library developed as part of FXA-7656
export enum ERRORS {
  CART_NOT_FOUND = 'Cart not found for id',
}

export class CartManager {
  private log: Logger;
  constructor(log: Logger) {
    this.log = log;
  }

  public async setupCart(input: SetupCart): Promise<CartType> {
    const cart = await Cart.create({
      ...input,
      state: CartState.START,
      interval: input.interval || DEFAULT_INTERVAL,
      amount: 0, // Hardcoded to 0 for now. TODO - Actual amount to be added in FXA-7521
    });

    return {
      ...cart,
      nextInvoice: InvoiceFactory(), // Temporary
    };
  }

  public async restartCart(cartId: string): Promise<CartType> {
    try {
      const cart = await Cart.patchById(cartId, { state: CartState.START });

      return {
        ...cart,
        nextInvoice: InvoiceFactory(), // Temporary
      };
    } catch (error) {
      throw new NotFoundError({ message: ERRORS.CART_NOT_FOUND });
    }
  }

  public async checkoutCart(cartId: string): Promise<CartType> {
    try {
      const cart = await Cart.patchById(cartId, {
        state: CartState.PROCESSING,
      });

      return {
        ...cart,
        nextInvoice: InvoiceFactory(), // Temporary
      };
    } catch (error) {
      throw new NotFoundError({ message: ERRORS.CART_NOT_FOUND });
    }
  }

  public async updateCart(input: UpdateCart): Promise<CartType> {
    const { id: cartId, ...rest } = input;
    try {
      const cart = await Cart.patchById(cartId, { ...rest });

      return {
        ...cart,
        nextInvoice: InvoiceFactory(), // Temporary
      };
    } catch (error) {
      throw new NotFoundError({ message: ERRORS.CART_NOT_FOUND });
    }
  }
}
