/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Serve the WAICT canary script. The canary is deliberately absent from the
 * integrity manifest, so referencing it from a page produces a guaranteed
 * `missing_from_manifest` violation report on every load. A steady stream of
 * canary reports proves the browser -> report-endpoint pipeline is live;
 * their disappearance means reporting is broken, not that the origin is clean.
 */

'use strict';

// Inert no-op. The script's only purpose is to be fetched as a `script`
// destination so WAICT checks it against the manifest and fails to match.
const CANARY_BODY = '/* waict canary */\n';

module.exports = function () {
  return {
    method: 'get',
    path: '/waict-canary.js',
    process: function (req, res) {
      // Never cache, so every page load re-fetches and re-checks the canary.
      res.setHeader('Cache-Control', 'no-store');
      res.type('application/javascript');
      res.send(CANARY_BODY);
    },
  };
};
