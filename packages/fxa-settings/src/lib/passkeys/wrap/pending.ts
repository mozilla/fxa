/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hexToUint8 } from 'fxa-auth-client/lib/utils';
import type { SensitiveDataClient } from '../../sensitive-data-client';

/**
 * Hands `kB` to the password-free passkey opt-in when a ceremony for this
 * account has asked for it. Never throws: the opt-in is optional and must not
 * fail the sign-in that produced `kB`.
 */
export function captureKbForPendingWrap(
  sensitiveDataClient: SensitiveDataClient,
  uid: string,
  kB: hexstring
): void {
  const pendingWrap = sensitiveDataClient.PasskeyWrapData;
  if (pendingWrap?.uid !== uid) {
    return;
  }
  try {
    pendingWrap.kB?.fill(0);
    pendingWrap.kB = hexToUint8(kB);
  } catch {
    pendingWrap.kB = undefined;
  }
}
