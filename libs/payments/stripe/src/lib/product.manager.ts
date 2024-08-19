/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { StripeClient } from './stripe.client';

@Injectable()
export class ProductManager {
  constructor(private client: StripeClient) {}

  async retrieve(productId: string) {
    const product = await this.client.productsRetrieve(productId);
    return product;
  }
}
