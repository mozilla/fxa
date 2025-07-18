/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { CartStore } from './cart-als.types';

export const CartStoreFactory = (override?: Partial<CartStore>): CartStore => ({
  checkout: {
    subscriptionId: undefined,
  },
  ...override,
});
