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
    require('./routes/get-metrics-errors')()
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
      '/signin',
      '/signup',
      '/signup_complete',
      '/confirm',
      '/settings',
      '/settings/avatar/change',
      '/settings/avatar/crop',
      '/settings/avatar/gravatar',
      '/settings/avatar/camera',
      '/settings/avatar/gravatar_permissions',
      '/settings/change_password',
      '/settings/communication_preferences',
      '/settings/delete_account',
      '/settings/display_name',
      '/legal',
      '/cannot_create_account',
      '/verify_email',
      '/reset_password',
      '/confirm_reset_password',
      '/complete_reset_password',
      '/reset_password_complete',
      '/force_auth',
      '/oauth',
      '/oauth/signin',
      '/oauth/signup',
      '/oauth/force_auth',
      '/cookies_disabled',
      '/clear',
      '/confirm_account_unlock',
      '/complete_unlock_account',
      '/account_unlock_complete',
      '/signup_permissions',
      '/signin_permissions',
      '/unexpected_error'
    ];

    var ALLOWED_TO_FRAME = {
      '/': true,
      '/oauth/': true,
      '/oauth/signin': true,
      '/oauth/signup': true,
      '/oauth/force_auth': true
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
      app.post('/_/csp-violation', function (req, res) {
        logger.warn('Content-Security-Policy Violation Report:');
        logger.warn(req.body);
        res.json({result: 'ok'});
      });

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
        message: req.query.message,
        errno: req.query.errno,
        namespace: req.query.namespace,
        context: req.query.context,
        param: req.query.param,
        client_id: req.query.client_id //eslint-disable-line camelcase
      });
      return res.render('400', {
        message: req.query.message
      });
    });

    app.get('/500.html', function (req, res) {
      res.removeHeader('x-frame-options');
      logger.error('500.html', {
        message: req.query.message,
        errno: req.query.errno,
        namespace: req.query.namespace,
        context: req.query.context
      });
      return res.render('500');
    });

  };

};

