/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { base64urlToBytes } from '../../base64url';

/**
 * The account the `mfa:passkey` proof names. The server files wraps under this
 * `sub`, so both sealing and opening bind the envelope to it; any other uid
 * would seal an envelope that never opens.
 */
export function uidFromMfaToken(mfaToken: string): string | undefined {
  try {
    const payload = mfaToken.split('.')[1];
    const { sub } = JSON.parse(
      new TextDecoder().decode(base64urlToBytes(payload))
    );
    return typeof sub === 'string' && /^[0-9a-f]{32}$/.test(sub)
      ? sub
      : undefined;
  } catch {
    return undefined;
  }
}
