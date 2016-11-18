/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const AppError = require('../error');
const auth = require('../auth');
const config = require('../config').getProperties();
const env = require('../env');
const logger = require('../logging')('server.clients');
const hapiLogger = require('../logging')('server.hapi');
const summary = require('../logging/summary');

exports.create = function createServer() {
  var isProd = env.isProdLike();

  var server = new Hapi.Server(
    require('./config')
  );

  server.connection({
    host: config.serverInternal.host,
    port: config.serverInternal.port
  });

  server.auth.scheme(auth.AUTH_SCHEME, auth.strategy);
  server.auth.strategy(auth.AUTH_STRATEGY, auth.AUTH_SCHEME);

  if (config.hpkpConfig && config.hpkpConfig.enabled) {
    var hpkpOptions = {
      maxAge: config.hpkpConfig.maxAge,
      sha256s: config.hpkpConfig.sha256s,
      includeSubdomains: config.hpkpConfig.includeSubDomains
    };

    if (config.hpkpConfig.reportUri){
      hpkpOptions.reportUri = config.hpkpConfig.reportUri;
    }

    if (config.hpkpConfig.reportOnly){
      hpkpOptions.reportOnly = config.hpkpConfig.reportOnly;
    }

    server.register({
      register: require('hapi-hpkp'),
      options: hpkpOptions
    }, function (err) {
      if (err) {
        throw err;
      }
    });
  }

  var routes = require('../routing').clients;
  if (isProd) {
    logger.info('prod', 'Disabling response schema validation');
    routes.forEach(function(route) {
      delete route.config.response;
    });
  }

  // default to stricter content-type
  routes.forEach(function(route) {
    var method = route.method.toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      if (!route.config.payload) {
        route.config.payload = {
          allow: ['application/json', 'application/x-www-form-urlencoded']
        };
      }
      logger.verbose('route.payload', {
        path: route.path,
        method: method,
        payload: route.config.payload
      });
    }
  });

  server.route(routes);

  // hapi internal logging: server and request
  server.on('log', function onServerLog(ev, tags) {
    if (tags.error && tags.implementation) {
      hapiLogger.critical('error.uncaught', { tags: ev.tags, error: ev.data });
    }
  });

  server.on('request', function onRequestLog(req, ev, tags) {
    if (tags.error && tags.implementation) {
      hapiLogger.critical('error.uncaught', { tags: ev.tags, error: ev.data });
    }
  });

  server.ext('onPreResponse', function onPreResponse(request, next) {
    var response = request.response;
    if (response.isBoom) {
      response = AppError.translate(response);
    }
    summary(request, response);
    next(response);
  });

  return server;
};
