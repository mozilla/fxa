/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


var url = require('url');
var dns = require('dns');
var path = require('path');
var fs = require('fs');
var config = require('./configuration');
var logger = require('intel').getLogger('server.routes');

/**
 * Each route has 3 attributes: method, path and process.
 * method is one of `GET`, `POST`, etc.
 * path is a string or regular expression that express uses to match a route.
 * process is a function that is called with req and res to handle the route.
 */
function isValidRoute(route) {
  return !! route.method && route.path && route.process;
}

module.exports = function (config, templates, i18n) {

  var ver = require('./routes/get-ver.json');
  var termsPrivacy = require('./routes/get-terms-privacy')(i18n);

  var routes = [
    ver,
    termsPrivacy
  ];

  var authServerHost = url.parse(config.get('fxaccount_url')).hostname;

  return function (app) {
    // handle password reset links
    app.get('/v1/complete_reset_password', function (req, res) {
      res.redirect(req.originalUrl.slice(3));
    });

    app.get('/config', function (req, res) {
      res.json({
        fxaccountUrl: config.get('fxaccount_url'),
        i18n: config.get('i18n')
      });
    });

    // handle email verification links
    app.get('/v1/verify_email', function (req, res) {
      res.redirect(req.originalUrl.slice(3));
    });

    app.get('/template/:lang/:type', function (req, res) {
      res.json(templates(req.params.lang, req.params.type));
    });

    // front end mocha tests
    if (config.get('env') === 'development') {
      app.get('/tests/index.html', function (req, res) {
        var checkCoverage = 'coverage' in req.query &&
                                req.query.coverage !== 'false';
        return res.render('mocha', {
          check_coverage: checkCoverage
        });
      });
    }

    // an array is used instead of a regexp simply because the regexp
    // became too long. One route is created for each item.
    var FRONTEND_ROUTES = [
      '/signin',
      '/signin_complete',
      '/signup',
      '/signup_complete',
      '/confirm',
      '/settings',
      '/change_password',
      '/legal',
      '/cannot_create_account',
      '/verify_email',
      '/reset_password',
      '/confirm_reset_password',
      '/complete_reset_password',
      '/reset_password_complete',
      '/delete_account',
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

    app.get('/', function(req, res) {
      res.render('index');
    });

    routes.forEach(function (route) {
      if (! isValidRoute(route)) {
        return logger.error('route definition invalid: ', route);
      }
      app[route.method](route.path, route.process);
    });
  };

};

