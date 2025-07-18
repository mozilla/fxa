/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AsyncLocalStorage } from 'async_hooks';
import { Provider } from '@nestjs/common';
import type { CartStore } from './cart-als.types';

export const AsyncLocalStorageCart = Symbol('ALSC');

export const AsyncLocalStorageCartProvider: Provider<
  AsyncLocalStorage<CartStore>
> = {
  provide: AsyncLocalStorageCart,
  useValue: new AsyncLocalStorage<CartStore>(),
};
