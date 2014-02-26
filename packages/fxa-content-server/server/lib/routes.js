/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


var url = require('url');
var dns = require('dns');
var config = require('./configuration');

module.exports = function (fxAccountUrl, templates) {

  var authServerHost = url.parse(fxAccountUrl).hostname;


  // Use a DNS lookup to get the ip address of the auth-server
  function authServerIpAsync(cb) {
    dns.lookup(authServerHost, function (err, address) {
      if (err) {
        return cb(err);
      }
      return cb(null, address);
    });
  }

  return function (app) {
    // handle password reset links
    app.get('/v1/complete_reset_password', function (req, res) {
      res.redirect(req.originalUrl.slice(3));
    });

    app.get('/config', function (req, res) {
      res.json({
        fxaccountUrl: fxAccountUrl
      });
    });

    // handle email verification links
    app.get('/v1/verify_email', function (req, res) {
      res.redirect(req.originalUrl.slice(3));
    });

    app.get('/template/:lang/:type', function (req, res) {
      authServerIpAsync(function (err, address) {
        if (err) {
          return res.send(500, err);
        } else if (req.ip !== address) {
          // Only the configured auth-server is allowed to get our templates
          return res.send(403, 'Forbidden');
        }
        res.json(templates(req.params.lang, req.params.type));
      });
    });

    // front end mocha tests
    if (config.get('env') === 'development') {
      app.get('/tests/index.html', function (req, res) {
        var checkCoverage = 'coverage' in req.query &&
                                req.query['coverage'] !== 'false';
        return res.render('mocha', {
          check_coverage: checkCoverage
        });
      });
    }

    // an array is used instead of a regexp simply because the regexp
    // became too long. One route is created for each item.
    var FRONTEND_ROUTES = [
      '/',
      '/signin',
      '/signin_complete',
      '/signup',
      '/signup_complete',
      '/confirm',
      '/settings',
      '/change_password',
      '/legal',
      '/legal/terms',
      '/legal/privacy',
      '/cannot_create_account',
      '/verify_email',
      '/reset_password',
      '/confirm_reset_password',
      '/complete_reset_password',
      '/reset_password_complete',
      '/force_auth'
    ];

    FRONTEND_ROUTES.forEach(function (route) {
      app.get(route, function (req, res, next) {
        // setting the url to / will use the correct
        // index.html for either dev or prod mode.
        req.url = '/';
        next();
      });
    });
  };

};
