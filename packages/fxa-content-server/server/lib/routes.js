/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {
  celebrate,
  isCelebrate,
  errors: celebrateErrors,
} = require('celebrate');
const cors = require('cors');
const logger = require('./logging/log')('server.routes');
const raven = require('./raven');

/**
 * Each route has 3 attributes: `method`, `path` and `process`.
 * `method` is one of `GET`, `POST`, etc.
 * `path` is a string or regular expression that express uses to match a route.
 * `process` is a function that is called with req and res to handle the route.
 *
 * Each route can have 2 additional attributes: `preProcess` and `validate`.
 * `preProcess` is a function that is called with `req`, `res`, and `next`.
 *   Use to do any pre-processing before validation, such as converting from text to JSON.
 * `validate` is where to declare JOI validation. Follows
 *   [celebrate](https://www.npmjs.com/package/celebrate) conventions.
 */
function isValidRoute(route) {
  return !!route.method && route.path && route.process;
}

module.exports = function(config, i18n) {
  const redirectVersionedToUnversioned = require('./routes/redirect-versioned-to-unversioned');

  const routes = [
    redirectVersionedToUnversioned('complete_reset_password'),
    redirectVersionedToUnversioned('reset_password'),
    redirectVersionedToUnversioned('verify_email'),
    require('./routes/get-apple-app-site-association')(),
    require('./routes/get-frontend-pairing')(),
    require('./routes/get-frontend')(),
    require('./routes/get-oauth-success'),
    require('./routes/get-terms-privacy')(i18n),
    require('./routes/get-update-firefox')(config),
    require('./routes/get-index')(config),
    require('./routes/get-ver.json'),
    require('./routes/get-client.json')(i18n),
    require('./routes/get-config')(i18n),
    require('./routes/get-fxa-client-configuration')(config),
    require('./routes/get-lbheartbeat')(),
    require('./routes/get-openid-configuration')(config),
    require('./routes/get-version.json'),
    require('./routes/get-metrics-flow')(config),
    require('./routes/get-well-known-change-password')(),
    require('./routes/post-metrics')(config),
    require('./routes/post-metrics-errors')(),
    require('./routes/redirect-complete-to-verified')(),
    require('./routes/redirect-download-firefox')(config),
    require('./routes/redirect-m-to-adjust')(config),
    require('./routes/get-500')(config),
  ];

  if (config.get('csp.enabled')) {
    routes.push(
      require('./routes/post-csp')({
        op: 'server.csp',
        path: config.get('csp.reportUri'),
      })
    );
  }

  if (config.get('csp.reportOnlyEnabled')) {
    routes.push(
      require('./routes/post-csp')({
        op: 'server.csp.report-only',
        path: config.get('csp.reportOnlyUri'),
      })
    );
  }

  if (config.get('env') === 'development') {
    routes.push(require('./routes/get-502')(config));
    routes.push(require('./routes/get-503')(config));
    // Add a route in dev mode to test 500 errors
    routes.push(require('./routes/get-boom')());
    // front end mocha tests
    routes.push(require('./routes/get-test-index')(config));
    routes.push(require('./routes/get-test-style-guide')(config));
  }

  return function(app) {
    routes.forEach(function(route) {
      if (!isValidRoute(route)) {
        return logger.error('route definition invalid: ', route);
      }

      // Build a list of route handlers.
      // `cors`, preProcess` and `validate` are optional.
      const routeHandlers = [];

      // Enable CORS using https://github.com/expressjs/cors
      // If defined, `cors` can be truthy or an object.
      // Objects are passed to the middleware directly.
      // Other truthy values use the default configuration.
      if (route.cors) {
        const corsConfig =
          typeof route.cors === 'object' ? route.cors : undefined;
        // Enable the pre-flight OPTIONS request
        app.options(route.path, cors(corsConfig));
        routeHandlers.push(cors(corsConfig));
      }

      if (route.preProcess) {
        routeHandlers.push(route.preProcess);
      }

      if (route.validate) {
        routeHandlers.push(
          celebrate(route.validate, {
            // silently drop any unknown fields within objects on the ground.
            stripUnknown: { arrays: false, objects: true },
          })
        );
      }

      routeHandlers.push(route.process);
      app[route.method].apply(app, [route.path].concat(routeHandlers));
    });

    const defaultErrorHandler = celebrateErrors();
    app.use((err, req, res, next) => {
      if (err && isCelebrate(err)) {
        logger.error('validation.failed', {
          err,
          method: req.method,
          path: req.url,
        });
      }
      defaultErrorHandler(err, req, res, next);
      // capture validation errors
      raven.ravenModule.captureException(err);
    });
  };
};
