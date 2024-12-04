/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CartState } from '@fxa/shared/db/mysql/account/kysely-types';
import { SupportedPages } from './types';

export const cartStateToPageMap = {
  [CartState.START]: SupportedPages.START,
  [CartState.PROCESSING]: SupportedPages.PROCESSING,
  [CartState.NEEDS_INPUT]: SupportedPages.NEEDS_INPUT,
  [CartState.SUCCESS]: SupportedPages.SUCCESS,
  [CartState.FAIL]: SupportedPages.ERROR,
};

export function validateCartState(
  cartState: CartState,
  currentPage: SupportedPages
) {
  return cartStateToPageMap[cartState] === currentPage;
}

export function getRedirect(cartState: CartState) {
  return cartStateToPageMap[cartState];
}
