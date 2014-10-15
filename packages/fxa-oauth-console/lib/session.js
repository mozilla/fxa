/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sessions = require('client-sessions');

module.exports = function (req, res, next) {
  if (/^\/oauth/.test(req.url)) {
    res.setHeader('Cache-Control', 'no-cache, max-age=0');

    return sessions({
      cookieName: 'fxa-oauth-console',
      // TODO: add cookie_secret to config
      secret: process.env['COOKIE_SECRET'] || 'define a real secret, please',
      requestKey: 'session',
      cookie: {
        path: '/oauth',
        httpOnly: true
      }
    })(req, res, next);
  } else {
    return next();
  }
};
