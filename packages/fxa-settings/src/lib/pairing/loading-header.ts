/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Whether the app's loading states should leave out the Mozilla logo header.
 * The mobile pairing screens have no header, so their loading states, and the
 * page a scanned QR lands on before Pair routes it there, leave it out too.
 *
 * `isV2Handoff` comes from the pairing capture, which lasts for the whole tab,
 * so it only counts on the landing path. Other /pair pages keep the header.
 */
export function hidesLoadingHeader(
  pathname: string,
  isV2Handoff: boolean
): boolean {
  if (pathname.startsWith('/pair/supplicant')) {
    return true;
  }
  return (pathname === '/pair' || pathname === '/pair/') && isV2Handoff;
}
