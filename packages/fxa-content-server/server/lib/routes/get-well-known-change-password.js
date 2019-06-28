/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const CHANGE_PASSWORD_ROUTE = '/settings/change_password';

module.exports = function() {
  const route = {};
  route.method = 'get';
  route.path = '/.well-known/change-password';

  route.process = function(req, res) {
    res.redirect(301, CHANGE_PASSWORD_ROUTE);
  };

  return route;
};
