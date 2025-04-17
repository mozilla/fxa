/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* This script re-encodes the current URL’s query parameters to ensure that any special
 * characters (such as '+') are properly encoded. This re-encoding is necessary due to
 * backwards compatibility requirements for clients (e.g., the VPN client) that send
 * unencoded query components, which can cause issues with parameter validation in the app.
 *
 * The script works by:
 *   1. Reading the current query string from window.location.
 *   2. Decoding each parameter value and then re-encoding it using encodeURIComponent.
 *   3. Replacing the query string in the browser's address bar using window.history.replaceState
 *      if the new query string differs from the original.
 *
 * This external file is loaded via an absolute path in index.html (e.g., <script src="%PUBLIC_URL%/query-fix.js"></script>)
 * and is executed as early as possible—before the main bundle loads—to ensure that subsequent
 * application logic (e.g., routing, query parameter parsing) sees the updated URL. */

(function encodeUrlQuery() {
  const { search } = window.location;
  if (!search) return;
  const newSearch =
    '?' +
    search
      .slice(1)
      .split('&')
      .map((pair) => {
        const [key, value = ''] = pair.split('=');
        return `${key}=${encodeURIComponent(decodeURIComponent(value))}`;
      })
      .join('&');
  if (newSearch !== search) {
    window.history.replaceState({}, '', newSearch);
  }
})();
