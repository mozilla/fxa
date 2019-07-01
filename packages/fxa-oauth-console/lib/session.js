/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global require, module */

var sessions = require('client-sessions');

var conf = require('./config');
var baseUrl = conf.get('base_url');
var sessionSecret = conf.get('server').session;

if (!sessionSecret) {
  throw new Error('Session secret not configured.');
}

module.exports = function(req, res, next) {
  if (/^\/oauth/.test(req.url)) {
    res.setHeader('Cache-Control', 'no-cache, max-age=0');

    return sessions({
      cookieName: 'fxa-oauth-console',
      secret: sessionSecret,
      requestKey: 'session',
      cookie: {
        path: baseUrl + 'oauth',
        httpOnly: true,
      },
    })(req, res, next);
  } else {
    return next();
  }
};
