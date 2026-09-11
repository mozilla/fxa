/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared helper for scrubbing PII out of URLs before they are written to logs.
// Used by the violation-report collectors (post-csp.js, post-waict-report.js),
// which log URLs that arrive in untrusted, unauthenticated report bodies. This
// is the single canonical implementation - previously the logic was
// copy-pasted into each collector and had already drifted between them.

'use strict';

// The WHATWG URL parser (unlike the legacy `url.parse`) throws deterministically
// on non-URL input, which makes the try/catch below meaningful.
const { URL } = require('url');

// Query parameters known to carry PII in FxA URLs. Removed from any logged URL.
const PII_QUERY_PARAMS = ['email', 'uid'];

/**
 * Remove PII (email/uid query params + fragment) from a URL so it is safe to
 * log. Relative URLs are scrubbed too; non-URL tokens are returned unchanged.
 *
 * @param {String} urlToScrub
 * @returns {String} scrubbed URL, or '' for empty/non-string input
 */
function stripPIIFromUrl(urlToScrub) {
  if (!urlToScrub || typeof urlToScrub !== 'string') {
    return '';
  }

  // Parse absolute URLs directly; fall back to a throwaway base so relative
  // URLs (which `new URL` rejects on their own) are still scrubbed.
  let parsed;
  let isRelative = false;
  try {
    parsed = new URL(urlToScrub);
  } catch (e) {
    try {
      parsed = new URL(urlToScrub, 'https://waict.invalid');
      isRelative = true;
    } catch (e2) {
      // Not a URL at all (e.g. a CSP keyword like "inline"/"eval").
      return urlToScrub;
    }
  }

  const hasPII =
    PII_QUERY_PARAMS.some((param) => parsed.searchParams.has(param)) ||
    parsed.hash !== '';
  if (!hasPII) {
    // Nothing to strip; return the input untouched to preserve its exact shape.
    return urlToScrub;
  }

  PII_QUERY_PARAMS.forEach((param) => parsed.searchParams.delete(param));
  parsed.hash = '';

  return isRelative ? parsed.pathname + parsed.search : parsed.toString();
}

module.exports = {
  stripPIIFromUrl,
  PII_QUERY_PARAMS,
};
