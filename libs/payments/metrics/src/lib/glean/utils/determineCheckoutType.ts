/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import type { CheckoutTypesType } from '../glean.types';

export function determineCheckoutType(isNewAccount?: string): CheckoutTypesType {
  // If isNewAccount, return  without-accounts
  // If !isNewAccount && isLoggedIn, return  with-accounts
  // If !isNewAccount && !isLoggedIn, return  ''?
  /*if (isNewAccount === 'true') {
    console.log('new account is true')
    return 'without-accounts';
  } else if (!isNewAccount || isNewAccount !== 'true' ) {
    return 'with-accounts';
  } else {
    return '';  ??
  } */

  return isNewAccount === 'true' ? 'without-accounts' : 'with-accounts';
}
