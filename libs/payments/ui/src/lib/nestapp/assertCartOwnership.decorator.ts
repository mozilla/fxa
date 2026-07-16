/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSessionUid } from '@fxa/payments/ui-auth';
import { CartUidMismatchError } from '@fxa/payments/cart';

/**
 * Throws CartUidMismatchError before the decorated method runs when the cart has
 * a uid and it does not match the current session uid.
 */
export function AssertCartOwnership() {
  return function (_target: any, _key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, args: any) {
      const cartId = args?.cartId as string;
      const sessionUid = await getSessionUid();

      const cart = await this.cartManager.fetchCartById(cartId);
      if (cart.uid && cart.uid !== sessionUid) {
        throw new CartUidMismatchError(cart.id, sessionUid);
      }

      return originalMethod.apply(this, [args]);
    };

    return descriptor;
  };
}
