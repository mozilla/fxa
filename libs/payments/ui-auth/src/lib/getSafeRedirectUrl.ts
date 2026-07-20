/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function getSafeRedirectUrl(
  url: string,
  baseUrl: string,
  allowedOrigins: string[]
): string {
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  try {
    const urlOrigin = new URL(url).origin;
    if (urlOrigin === baseUrl || allowedOrigins.includes(urlOrigin)) {
      return url;
    }
  } catch {
    // Malformed URL - fall through to baseUrl.
  }
  return baseUrl;
}
