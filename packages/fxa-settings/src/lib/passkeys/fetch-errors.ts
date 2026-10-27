/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// fetch rejects with a TypeError worded per engine when the network fails.
// Any other TypeError is a bug, and so is a wording missing from this list.
const FETCH_NETWORK_ERROR_MESSAGES = new Set([
  'Failed to fetch', // Chromium
  'NetworkError when attempting to fetch resource.', // Gecko
  'Load failed', // WebKit
]);

/** A network failure, or auth-client aborting a request at its timeout. */
export function isOfflineOrTimedOut(err: unknown): boolean {
  return (
    (err instanceof TypeError &&
      FETCH_NETWORK_ERROR_MESSAGES.has(err.message)) ||
    (err instanceof DOMException && err.name === 'AbortError')
  );
}
