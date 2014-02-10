/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./configuration');
const path = require('path');

module.exports = function(app) {
  'use strict';

  // handle password reset links
  app.get('/v1/complete_reset_password', function(req, res) {
    res.redirect(req.originalUrl.slice(3));
  });

  app.get('/config', function(req, res) {
    res.json({
      fxaccountUrl: config.get('fxaccount_url')
    });
  });

  // handle email verification links
  app.get('/v1/verify_email', function(req, res) {
    res.redirect(req.originalUrl.slice(3));
  });

  app.get(/\/[^.]*$/, function(req, res, next) {
    // setting the url to / will use the correct index.html for either dev or
    // prod mode.
    req.url = '/';
    next();
  });
};
