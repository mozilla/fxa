/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getBasicAccountData } from '../account-storage';
import type { SignedInUser } from '../channels/firefox';

/**
 * The account a pairing hands over: the one Firefox Sync is signed in to, which
 * can differ from the current local account. Falls back to the current local
 * account when the browser reports no signed-in user.
 */
export function getPairingAccount(
  signedInUser?: Pick<SignedInUser, 'uid' | 'sessionToken'>
) {
  const localAccount = getBasicAccountData(signedInUser?.uid);
  return {
    uid: signedInUser?.uid ?? localAccount?.uid,
    sessionToken: signedInUser?.sessionToken ?? localAccount?.sessionToken,
    totpVerifiedAt: localAccount?.totpVerifiedAt,
  };
}
