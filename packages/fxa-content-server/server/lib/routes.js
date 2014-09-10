/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


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

  var routes = [
    require('./routes/get-index')(),
    require('./routes/get-ver.json'),
    require('./routes/get-terms-privacy')(i18n),
    require('./routes/get-config')(i18n),
    require('./routes/get-client.json')(i18n),
    require('./routes/post-metrics')()
  ];

  if (config.get('api_proxy.enabled')) {
    routes.push(
      require('./routes/get-auth'),
      require('./routes/post-auth'),
      require('./routes/get-oauth'),
      require('./routes/post-oauth'),
      require('./routes/get-profile_api'),
      require('./routes/post-profile_api')
    );
  }

  return function (app) {
    // handle password reset links
    app.get('/v1/complete_reset_password', function (req, res) {
      res.redirect(req.originalUrl.slice(3));
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
        var coverNever = JSON.stringify(config.get('tests.coverage.excludeFiles'));

        return res.render('mocha', {
          check_coverage: checkCoverage,
          cover_never: coverNever
        });
      });
    }

    // an array is used instead of a regexp simply because the regexp
    // became too long. One route is created for each item.
    var FRONTEND_ROUTES = [
      '/signin',
      '/signup',
      '/signup_complete',
      '/confirm',
      '/settings',
      '/settings/avatar',
      '/settings/avatar/change',
      '/settings/avatar/crop',
      '/settings/avatar/gravatar',
      '/settings/avatar/camera',
      '/change_password',
      '/legal',
      '/cannot_create_account',
      '/verify_email',
      '/reset_password',
      '/confirm_reset_password',
      '/complete_reset_password',
      '/reset_password_complete',
      '/delete_account',
      '/force_auth',
      '/oauth/signin',
      '/oauth/signup',
      '/cookies_disabled',
      '/clear'
    ];

    FRONTEND_ROUTES.forEach(function (route) {
      app.get(route, function (req, res, next) {
        // setting the url to / will use the correct
        // index.html for either dev or prod mode.
        req.url = '/';
        next();
      });
    });

    routes.forEach(function (route) {
      if (! isValidRoute(route)) {
        return logger.error('route definition invalid: ', route);
      }
      app[route.method](route.path, route.process);
    });

    if (config.get('env') === 'development') {
      app.post('/_/csp-violation', function(req, res) {
        logger.warn('Content-Security-Policy Violation Report:');
        logger.warn(req.body);
        res.json({result: 'ok'});
      });
    }

    // Add a route in dev mode to test 500 errors
    if (config.get('env') === 'development') {
      app.get('/boom', function(req, res, next) {
        next(new Error('Uh oh!'));
      });
    }
  };

};

