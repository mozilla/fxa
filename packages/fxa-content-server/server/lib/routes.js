/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./configuration');
const path = require('path');

module.exports = function(app) {
  function routeToVerify(req, res) {
    res.render('verify_email.html', {
      fxa: config.get('fxaccount_url'),
      code: req.query.code,
      uid: req.query.uid
    });
  }

  // route both of these to 'verify_email'
  app.get('/verify_email', function(req, res) {
    routeToVerify(req, res);
  });

  app.get('/v1/verify_email', function(req, res) {
    routeToVerify(req, res);
  });

  app.get('/flow/:page?',
    function(req, res) {
      res.render('accounts/desktop_flow.html', {
        fxa: config.get('fxaccount_url'),
        user: "null",
        verified: 0,
        page: JSON.stringify(req.params.page || ''),
        desktop: true
      });
    });

  app.get('/mobile/:page?',
    function(req, res) {
      res.render('accounts/flow.html', {
        fxa: config.get('fxaccount_url'),
        user: "null",
        verified: 0,
        page: JSON.stringify(req.params.page || '')
      });
    });

  app.get(/\/[^.]*$/, function(req, res) {
    res.sendfile(path.join(__dirname, '..', '..', 'app', 'index.html'));
  });

};
