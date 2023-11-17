/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartService } from '@fxa/payments/cart';

class AppServices {
  get cartService(): CartService {
    return (global as any).appServices.cartService;
  }
}

export const appServices = new AppServices();
