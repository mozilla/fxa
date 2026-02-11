/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE - With #4147, config is sent as a meta tag
// in the HTML and this route is no longer needed
// and a 410 (Gone) is returned.

'use strict';
module.exports = function () {
  const route = {};

  route.method = 'get';
  route.path = '/config';

  route.process = function (req, res) {
    res.status(410).json({});
  };

  return route;
};
