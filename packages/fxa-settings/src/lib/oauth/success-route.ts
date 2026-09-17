/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The URL can carry a trailing slash, so match the segment rather than taking
// the last one.
const OAUTH_SUCCESS_CLIENT_ID_REGEXP = /oauth\/success\/([^/]+)/;

export function getOAuthSuccessClientId(pathname: string) {
  return pathname.match(OAUTH_SUCCESS_CLIENT_ID_REGEXP)?.[1] || '';
}
