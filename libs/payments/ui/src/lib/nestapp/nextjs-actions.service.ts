/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartService } from '@fxa/payments/cart';
import { Injectable } from '@nestjs/common';
import { GetCartActionArgs } from './validators/GetCartActionArgs';
import { RestartCartActionArgs } from './validators/RestartCartActionArgs';
import { UpdateCartActionArgs } from './validators/UpdateCartActionArgs';
import { Validator } from 'class-validator';
import { SetupCartActionArgs } from './validators/SetupCartActionArgs';

/**
 * ANY AND ALL methods exposed via this service should be considered publicly accessible and callable with any arguments.
 * ALL server actions must use this service as a proxy to other NestJS services.
 */

@Injectable()
export class NextJSActionsService {
  constructor(private cartService: CartService) {}

  async getCart(args: GetCartActionArgs) {
    new Validator().validateOrReject(args);

    const cart = await this.cartService.getCart(args.cartId);

    return cart;
  }

  async updateCart(args: UpdateCartActionArgs) {
    new Validator().validateOrReject(args);

    await this.cartService.updateCart(
      args.cartId,
      args.version,
      args.cartDetails
    );
  }

  async restartCart(args: RestartCartActionArgs) {
    new Validator().validateOrReject(args);

    const cart = await this.cartService.restartCart(args.cartId);

    return cart;
  }

  async setupCart(args: SetupCartActionArgs) {
    new Validator().validateOrReject(args);

    const cart = await this.cartService.setupCart({
      ...args,
    });

    return cart;
  }
}
