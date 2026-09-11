/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { SensitiveDataClient } from '../sensitive-data-client';

/**
 * Zeroes and drops the material a passkey ceremony left for the password-free
 * passkey opt-in. Replacing the entry alone would leave the PRF output and
 * `kB` intact until garbage collection.
 */
export function clearPendingPasskeyWrap(
  sensitiveDataClient: SensitiveDataClient
) {
  const held = sensitiveDataClient.PasskeyWrapData;
  held?.prfOut.fill(0);
  held?.kB?.fill(0);
  sensitiveDataClient.PasskeyWrapData = undefined;
}
