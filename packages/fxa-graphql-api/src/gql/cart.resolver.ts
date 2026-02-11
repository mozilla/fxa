/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { Cart as CartType } from './model/cart.model';
import { SetupCartInput } from './dto/input/setup-cart.input';
import { CartIdInput } from './dto/input/cart-id.input';
import { UpdateCartInput } from './dto/input/update-cart.input';

@Resolver((of: any) => CartType)
export class CartResolver {
  constructor(private log: MozLoggerService) {}

  @Query((returns) => CartType, { nullable: true })
  public async cart(): Promise<CartType | null> {
    return null;
  }

  @Mutation((returns) => CartType, { nullable: true })
  public async setupCart(
    @Args('input', { type: () => SetupCartInput })
    input: SetupCartInput
  ): Promise<CartType | null> {
    return null;
  }

  @Mutation((returns) => CartType, { nullable: true })
  public async restartCart(
    @Args('input', { type: () => CartIdInput })
    input: CartIdInput
  ): Promise<CartType | null> {
    return null;
  }

  @Mutation((returns) => CartType, { nullable: true })
  public async checkoutCart(
    @Args('input', { type: () => CartIdInput })
    input: CartIdInput
  ): Promise<CartType | null> {
    return null;
  }

  @Mutation((returns) => CartType, { nullable: true })
  public async updateCart(
    @Args('input', { type: () => UpdateCartInput })
    input: UpdateCartInput
  ): Promise<CartType | null> {
    return null;
  }
}
