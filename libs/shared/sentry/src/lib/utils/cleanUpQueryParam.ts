/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Query parameters we allow to propagate to sentry
 */
const ALLOWED_QUERY_PARAMETERS = [
  'automatedBrowser',
  'client_id',
  'context',
  'entrypoint',
  'keys',
  'migration',
  'redirect_uri',
  'scope',
  'service',
  'setting',
  'style',
];

/**
 * Overwrites sensitive query parameters with a dummy value.
 *
 * @param url
 * @returns url
 */
export function cleanUpQueryParam(url = '') {
  const urlObj = new URL(url);

  if (!urlObj.search.length) {
    return url;
  }

  // Iterate the search parameters.
  urlObj.searchParams.forEach((_, key) => {
    if (!ALLOWED_QUERY_PARAMETERS.includes(key)) {
      // if the param is a PII (not allowed) then reset the value.
      urlObj.searchParams.set(key, 'VALUE');
    }
  });

  return urlObj.href;
}
