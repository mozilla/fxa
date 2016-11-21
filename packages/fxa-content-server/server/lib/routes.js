/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var babel = require('babel-middleware');
var logger = require('mozlog')('server.routes');
var path = require('path');

var VERSION_PREFIX = '/v1';
var VERSION_PREFIX_REGEXP = new RegExp('^' + VERSION_PREFIX);

/**
 * Each route has 3 attributes: method, path and process.
 * method is one of `GET`, `POST`, etc.
 * path is a string or regular expression that express uses to match a route.
 * process is a function that is called with req and res to handle the route.
 */
function isValidRoute(route) {
  return !! route.method && route.path && route.process;
}

module.exports = function (config, i18n) {

  var STATIC_RESOURCE_URL = config.get('static_resource_url');

  var routes = [
    require('./routes/get-terms-privacy')(i18n),
    require('./routes/get-index')(config),
    require('./routes/get-ver.json'),
    require('./routes/get-client.json')(i18n),
    require('./routes/get-config')(i18n),
    require('./routes/get-fxa-client-configuration')(config),
    require('./routes/get-openid-configuration')(config),
    require('./routes/get-metrics-errors')(),
    require('./routes/get-version.json'),
    require('./routes/post-metrics')(),
    require('./routes/post-metrics-errors')(),
    require('./routes/redirect-complete-to-verified')()
  ];

  if (config.get('csp.enabled')) {
    routes.push(require('./routes/post-csp')({
      path: config.get('csp.reportUri')
    }));
  }

  if (config.get('csp.reportOnlyEnabled')) {
    routes.push(require('./routes/post-csp')({
      op: 'server.csp.report-only',
      path: config.get('csp.reportOnlyUri')
    }));
  }

  function addVersionPrefix(unversionedUrl) {
    return VERSION_PREFIX + unversionedUrl;
  }

  function removeVersionPrefix(versionedUrl) {
    return versionedUrl.replace(VERSION_PREFIX_REGEXP, '');
  }

  return function (app) {
    // handle password reset links
    app.get(addVersionPrefix('/complete_reset_password'), function (req, res) {
      res.redirect(removeVersionPrefix(req.originalUrl));
    });

    // handle email verification links
    app.get(addVersionPrefix('/verify_email'), function (req, res) {
      res.redirect(removeVersionPrefix(req.originalUrl));
    });

    // handle reset password from notification emails
    app.get(addVersionPrefix('/reset_password'), function (req, res) {
      res.redirect(removeVersionPrefix(req.originalUrl));
    });

    if (config.get('babel.enabled')) {
      // Compile ES2015 scripts to ES5 before serving to the client.
      // This is done for two reasons:
      // 1. The blanket code coverage tool does not understand ES6, only ES5.
      // 2. It'll give us a better approximation of the code that'll eventually
      //    be run on prod.
      app.get('/scripts/*\.(js|map)', babel({
        babelOptions: {
          presets: ['babel-preset-es2015-nostrict'],
          sourceMaps: true
        },
        cachePath: path.join(__dirname, '..', '..', '.es5cache'),
        consoleErrors: true,
        exclude: ['scripts/{head|vendor}/**'],
        srcPath: path.join(__dirname, '..', '..', 'app')
      }));
    }

    if (config.get('env') === 'development') {
      // front end mocha tests
      app.get('/tests/index.html', function (req, res) {
        var checkCoverage = 'coverage' in req.query &&
                                req.query.coverage !== 'false';
        var coverNever = JSON.stringify(config.get('tests.coverage.excludeFiles'));

        return res.render('mocha', {
          check_coverage: checkCoverage, //eslint-disable-line camelcase
          cover_never: coverNever //eslint-disable-line camelcase
        });
      });
    }

    // an array is used instead of a regexp simply because the regexp
    // became too long. One route is created for each item.
    var FRONTEND_ROUTES = [
      '/',
      '/cannot_create_account',
      '/choose_what_to_sync',
      '/clear',
      '/complete_reset_password',
      '/complete_signin',
      '/confirm',
      '/confirm_reset_password',
      '/confirm_signin',
      '/cookies_disabled',
      '/force_auth',
      '/legal',
      '/oauth',
      '/oauth/force_auth',
      '/oauth/signin',
      '/oauth/signup',
      '/report_signin',
      '/reset_password',
      '/reset_password_confirmed',
      '/reset_password_verified',
      '/settings',
      '/settings/avatar/camera',
      '/settings/avatar/change',
      '/settings/avatar/crop',
      '/settings/avatar/gravatar',
      '/settings/avatar/gravatar_permissions',
      '/settings/change_password',
      '/settings/clients',
      '/settings/clients/disconnect',
      '/settings/communication_preferences',
      '/settings/delete_account',
      '/settings/display_name',
      '/signin',
      '/signin_confirmed',
      '/signin_permissions',
      '/signin_reported',
      '/signin_unblock',
      '/signin_verified',
      '/signup',
      '/signup_confirmed',
      '/signup_permissions',
      '/signup_verified',
      '/verify_email'
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
      app.get('/503.html', function (req, res) {
        return res.render('503', { staticResourceUrl: STATIC_RESOURCE_URL });
      });

      app.get('/502.html', function (req, res) {
        return res.render('502', { staticResourceUrl: STATIC_RESOURCE_URL });
      });

      // Add a route in dev mode to test 500 errors
      app.get('/boom', function (req, res, next) {
        next(new Error('Uh oh!'));
      });
    }

    app.get('/500.html', function (req, res) {
      return res.render('500', { staticResourceUrl: STATIC_RESOURCE_URL });
    });
  };
};
