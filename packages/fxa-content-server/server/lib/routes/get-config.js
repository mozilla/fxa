/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var config = require('../configuration');

exports.method = 'get';
exports.path = '/config';

exports.process = function(req, res) {
  // charset must be set on json responses.
  res.charset = 'utf8';
  res.json({
    // The `__cookies_check` cookie is set in client code
    // to see if cookies are enabled. If cookies are disabled,
    // the `__cookie_check` cookie will not arrive.
    cookiesEnabled: !!req.cookies['__cookie_check'],
    fxaccountUrl: config.get('fxaccount_url'),
    i18n: config.get('i18n')
  });
};
