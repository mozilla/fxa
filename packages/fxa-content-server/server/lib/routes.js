/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const logger = require('mozlog')('server.routes');

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
  const redirectVersionedToUnversioned = require('./routes/redirect-versioned-to-unversioned');

  const routes = [
    redirectVersionedToUnversioned('complete_reset_password'),
    redirectVersionedToUnversioned('reset_password'),
    redirectVersionedToUnversioned('verify_email'),
    require('./routes/get-frontend')(),
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
    require('./routes/redirect-complete-to-verified')(),
    require('./routes/get-500')(config)
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

  if (config.get('env') === 'development') {
    routes.push(require('./routes/get-502')(config));
    routes.push(require('./routes/get-503')(config));
    // Add a route in dev mode to test 500 errors
    routes.push(require('./routes/get-boom')());
    // front end mocha tests
    routes.push(require('./routes/get-test-index')(config));
    routes.push(require('./routes/get-test-style-guide')(config));

    // Babel is *only* available in development
    if (config.get('babel.enabled')) {
      // Compile ES2015 scripts to ES5 before serving to the client.
      // This is done for two reasons:
      // 1. The blanket code coverage tool does not understand ES6, only ES5.
      // 2. It'll give us a better approximation of the code that'll eventually
      //    be run on prod.
      routes.push(require('./routes/get-babelified-source')(config));
    }
  }

  return function (app) {
    routes.forEach(function (route) {
      if (! isValidRoute(route)) {
        return logger.error('route definition invalid: ', route);
      }
      app[route.method](route.path, route.process);
    });
  };
};
