/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var logger = require('mozlog')('server.routes');

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

  var routes = [
    require('./routes/get-terms-privacy')(i18n),
    require('./routes/get-index')(),
    require('./routes/get-ver.json'),
    require('./routes/get-version.json'),
    require('./routes/get-config')(i18n),
    require('./routes/get-client.json')(i18n),
    require('./routes/post-metrics')(),
    require('./routes/post-csp')(),
    require('./routes/get-metrics-errors')(),
    require('./routes/get-openid-login')(config),
    require('./routes/get-openid-authenticate')(config)
  ];

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

    // handle account unlock links
    app.get(addVersionPrefix('/complete_unlock_account'), function (req, res) {
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

    // front end mocha tests
    if (config.get('env') === 'development') {
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
      '/account_unlock_complete',
      '/cannot_create_account',
      '/choose_what_to_sync',
      '/clear',
      '/complete_reset_password',
      '/complete_unlock_account',
      '/confirm',
      '/confirm_account_unlock',
      '/confirm_reset_password',
      '/cookies_disabled',
      '/force_auth',
      '/force_auth_complete',
      '/legal',
      '/oauth',
      '/oauth/force_auth',
      '/oauth/signin',
      '/oauth/signup',
      '/openid/start',
      '/reset_password',
      '/reset_password_complete',
      '/settings',
      '/settings/avatar/camera',
      '/settings/avatar/change',
      '/settings/avatar/crop',
      '/settings/avatar/gravatar',
      '/settings/avatar/gravatar_permissions',
      '/settings/change_password',
      '/settings/communication_preferences',
      '/settings/delete_account',
      '/settings/display_name',
      '/signin',
      '/signin_complete',
      '/signin_permissions',
      '/signup',
      '/signup_complete',
      '/signup_permissions',
      '/unexpected_error',
      '/verify_email'
    ];

    var ALLOWED_TO_FRAME = {
      '/': true,
      '/oauth/': true,
      '/oauth/force_auth': true,
      '/oauth/signin': true,
      '/oauth/signup': true
    };

    FRONTEND_ROUTES.forEach(function (route) {
      app.get(route, function (req, res, next) {
        if (ALLOWED_TO_FRAME[req.path]) {
          res.removeHeader('x-frame-options');
        }

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
        res.removeHeader('x-frame-options');
        return res.render('503');
      });

      app.get('/502.html', function (req, res) {
        res.removeHeader('x-frame-options');
        return res.render('502');
      });

      // Add a route in dev mode to test 500 errors
      app.get('/boom', function (req, res, next) {
        next(new Error('Uh oh!'));
      });
    }

    // we always want to handle these so we can do some logging.
    app.get('/400.html', function (req, res) {
      res.removeHeader('x-frame-options');
      logger.error('400.html', {
        client_id: req.query.client_id, //eslint-disable-line camelcase
        context: req.query.context,
        errno: req.query.errno,
        message: req.query.message,
        namespace: req.query.namespace,
        param: req.query.param
      });
      return res.render('400', {
        message: req.query.message
      });
    });

    app.get('/500.html', function (req, res) {
      res.removeHeader('x-frame-options');
      logger.error('500.html', {
        context: req.query.context,
        errno: req.query.errno,
        message: req.query.message,
        namespace: req.query.namespace
      });
      return res.render('500');
    });

  };

};

