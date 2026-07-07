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
 * Remove PII from a URL so it is safe to log.
 *
 * Strips the {@link PII_QUERY_PARAMS} query parameters and drops the fragment
 * entirely (fragments can carry tokens/identifiers and are never needed for
 * violation triage). Non-URL inputs (e.g. CSP keywords like `inline`/`eval`,
 * or relative paths) are returned unchanged since there is nothing parseable
 * to scrub.
 *
 * @param {String} urlToScrub
 * @returns {String} the scrubbed URL, or '' for empty/non-string input
 */
function stripPIIFromUrl(urlToScrub) {
  if (!urlToScrub || typeof urlToScrub !== 'string') {
    return '';
  }

  let parsed;
  try {
    parsed = new URL(urlToScrub);
  } catch (e) {
    // Not an absolute URL - nothing to scrub, return as-is.
    return urlToScrub;
  }

  PII_QUERY_PARAMS.forEach((param) => parsed.searchParams.delete(param));
  parsed.hash = '';

  return parsed.toString();
}

module.exports = {
  stripPIIFromUrl,
  PII_QUERY_PARAMS,
};
