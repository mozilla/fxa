/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Config } from '../../../lib/config';
import type { Account } from '../../../models';
import { canPromptForPasskey } from '../../../lib/passkeys/promo';
import { SETTINGS_PATH } from '../../../constants';

export type ProtectionItemId = 'passkey' | 'two-step-auth' | 'recovery-key';

export type ProtectionItem = { id: ProtectionItemId; route: string };

/**
 * Recommended protections this account can still set up, in display order.
 * Two-step authentication and the recovery key both build on a password.
 */
export function getProtectionItems(
  account: Pick<Account, 'passkeys' | 'hasPassword' | 'recoveryKey' | 'totp'>,
  config: Pick<Config, 'featureFlags'>
): ProtectionItem[] {
  const items: ProtectionItem[] = [];
  if (canPromptForPasskey(config, account.passkeys.length)) {
    items.push({ id: 'passkey', route: `${SETTINGS_PATH}/passkeys/add` });
  }
  if (account.hasPassword && !(account.totp.exists && account.totp.verified)) {
    items.push({
      id: 'two-step-auth',
      route: `${SETTINGS_PATH}/two_step_authentication`,
    });
  }
  if (account.hasPassword && !account.recoveryKey.exists) {
    items.push({
      id: 'recovery-key',
      route: `${SETTINGS_PATH}/account_recovery`,
    });
  }
  return items;
}
