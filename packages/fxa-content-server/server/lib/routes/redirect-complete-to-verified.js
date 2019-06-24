/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirect /*_complete to /*_verified. /*_complete was removed
 * in #4306, this ensures that users who somehow make it to these pages
 * are redirected to some content that is available.
 */

'use strict';
const url = require('url');

module.exports = function() {
  const route = {};

  route.method = 'get';
  route.path = /(signin|signup|reset_password)_complete/;

  route.process = function(req, res) {
    // The _complete screens were displayed in both the action initiating tabs
    // as well as the verification tab. To keep life simple, assume everyone
    // who did this action is in the verification tab and send them to the
    // _verified screen.
    const urlObj = url.parse(req.originalUrl);
    urlObj.pathname = urlObj.pathname.replace('_complete', '_verified');
    const redirectTo = url.format(urlObj);
    // Use a 302 until we are sure this train won't be rolled back to avoid
    // rollback and permanent redirect issues, I'm not sure how it could
    // happen, but it seems feasible the user tries to load a _complete screen,
    // after seeing a 301 redirect but we rolled back, and is redirected to
    // _verified screen.
    // Once we are sure we won't regress, this can be changed to a 301.
    res.redirect(302, redirectTo);
  };

  return route;
};
