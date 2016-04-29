/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Deprecated GET endpoint for /metrics-errors. Replaced by a POST endpoint.
 * Always responds with success to avoid 404 errors.
 */
module.exports = function () {

  return {
    method: 'get',
    path: '/metrics-errors',
    process: function (req, res) {
      res.json({ success: true });
    }
  };
};
