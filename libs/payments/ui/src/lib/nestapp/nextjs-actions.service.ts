/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartService } from '@fxa/payments/cart';
import { Injectable } from '@nestjs/common';

/**
 * ANY AND ALL methods exposed via this service should be considered publicly accessible and callable with any arguments.
 * ALL server actions must use this service as a proxy to other NestJS services.
 */

@Injectable()
export class NextJSActionsService {
  constructor(private cartService: CartService) {}

  async getCart(cartId: string) {
    const cart = await this.cartService.getCart(cartId);

    return cart;
  }
}
