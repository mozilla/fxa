/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { AccountManager } from '@fxa/shared/account/account';

export async function retrieveOptOut(
  accountManager: AccountManager,
  uid?: string
): Promise<boolean> {
  if (!uid) return false;

  try {
    const accounts = await accountManager.getAccounts([uid]);
    return accounts[0].metricsOptOutAt !== null;
  } catch (error) {
    return true; // Default to opt out
  }
}
