/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { Cart } from '../../../../shared/db/mysql/account/src';
import { InvoiceFactory } from '../lib/factories';
import { CartManager } from '../lib/manager';
import {
  CartIdInput,
  Cart as CartType,
  SetupCartInput,
  UpdateCartInput,
} from './index';

@Resolver((of: any) => CartType)
export class CartResolver {
  private cartManager: CartManager;
  constructor(private log: MozLoggerService) {
    this.cartManager = new CartManager(this.log);
  }

  @Query((returns) => CartType, { nullable: true })
  public async cart(): Promise<CartType | null> {
    // Query just for testing purposes
    // TODO - To be done in FXA-7521
    const cart = await Cart.query().first();
    if (!cart) {
      return null;
    }

    return {
      ...cart,
      nextInvoice: InvoiceFactory(), // Temporary
    };
  }

  @Mutation((returns) => CartType, { nullable: true })
  public async setupCart(
    @Args('input', { type: () => SetupCartInput })
    input: SetupCartInput
  ): Promise<CartType | null> {
    return this.cartManager.setupCart({
      ...input,
    });
  }

  @Mutation((returns) => CartType, { nullable: true })
  public async restartCart(
    @Args('input', { type: () => CartIdInput })
    input: CartIdInput
  ): Promise<CartType | null> {
    return this.cartManager.restartCart(input.id);
  }

  @Mutation((returns) => CartType, { nullable: true })
  public async checkoutCart(
    @Args('input', { type: () => CartIdInput })
    input: CartIdInput
  ): Promise<CartType | null> {
    return this.cartManager.checkoutCart(input.id);
  }

  @Mutation((returns) => CartType, { nullable: true })
  public async updateCart(
    @Args('input', { type: () => UpdateCartInput })
    input: UpdateCartInput
  ): Promise<CartType | null> {
    return this.cartManager.updateCart(input);
  }
}
