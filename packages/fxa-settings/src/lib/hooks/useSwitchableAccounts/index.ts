/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMemo } from 'react';
import { useLocalStorageSync } from '../useLocalStorageSync';
import {
  rankAccounts,
  SwitchableAccount,
} from '../../account-switcher/rank-accounts';
import { UnifiedAccountData } from '../../account-storage';

export interface UseSwitchableAccountsOptions {
  /** Email an RP asked for, via the `email` query param or location state. */
  requestedEmail?: string;
  /**
   * Overrides the mirrored uid. Sign-in surfaces hold the live fxa_status reply
   * and should pass it rather than read the mirror.
   */
  firefoxSignedInUid?: string | null;
  /** OAuth client asking for the sign-in, to suggest its last-used account. */
  clientId?: string;
}

/**
 * The stored accounts, best guess first, re-read whenever localStorage changes.
 */
export function useSwitchableAccounts({
  requestedEmail,
  firefoxSignedInUid,
  clientId,
}: UseSwitchableAccountsOptions = {}): SwitchableAccount[] {
  const accounts = useLocalStorageSync('accounts') as
    | Record<string, Partial<UnifiedAccountData>>
    | undefined;
  const currentAccountUid = useLocalStorageSync('currentAccountUid') as
    | string
    | undefined;
  const lastAccountByClient = useLocalStorageSync('lastAccountByClient') as
    | Record<string, string>
    | undefined;
  const mirroredFirefoxUid = useLocalStorageSync('firefoxSignedInUid') as
    | string
    | undefined;

  const resolvedFirefoxUid =
    firefoxSignedInUid !== undefined ? firefoxSignedInUid : mirroredFirefoxUid;

  return useMemo(
    () =>
      rankAccounts({
        accounts: accounts || {},
        requestedEmail,
        firefoxSignedInUid: resolvedFirefoxUid,
        currentAccountUid,
        lastUsedForClientUid: clientId && lastAccountByClient?.[clientId],
      }),
    [
      accounts,
      requestedEmail,
      resolvedFirefoxUid,
      currentAccountUid,
      clientId,
      lastAccountByClient,
    ]
  );
}

export default useSwitchableAccounts;
