/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import type { CheckoutTypesType } from '../glean.types';

export function determineCheckoutType(accountsUid?: string): CheckoutTypesType {
  return accountsUid ? 'with-accounts' : 'without-accounts';
}
