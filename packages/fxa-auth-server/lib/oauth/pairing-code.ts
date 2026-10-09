/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redis key marking an authorization code as minted by a device pairing,
 * keyed on the code's hash (never the code itself, which is a credential).
 * Written at /oauth/authorization, where the pairing is recognisable from the
 * requesting browser, and read when the code is redeemed, where it is not.
 * Expires with the code.
 */
export function pairingCodeCacheKey(codeIdHex: string): string {
  return `pairingCode:${codeIdHex}`;
}
