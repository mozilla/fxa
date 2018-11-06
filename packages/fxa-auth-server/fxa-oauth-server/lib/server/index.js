/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const AppError = require('../error');
const authBearer = require('../auth_bearer');
const config = require('../config').getProperties();
const configureSentry = require('./configureSentry');
const env = require('../env');
const logger = require('../logging')('server');
const hapiLogger = require('../logging')('server.hapi');
const summary = require('../logging/summary');

exports.create = async function createServer() {

  if (config.localRedirects && config.env !== 'dev') {
    // nightly, latest, etc will probably set this to true, but it's
    // worth explicitly yelling about it.
    logger.warn('localRedirect',
      '*** localRedirects is set to TRUE. Should only be used for developers.');
  }
  var isProd = env.isProdLike();
  var server = new Hapi.Server(
    require('./config')
  );

  server.auth.scheme(authBearer.AUTH_SCHEME, authBearer.strategy);
  server.auth.strategy(authBearer.AUTH_STRATEGY, authBearer.AUTH_SCHEME);

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

    await server.register({
      plugin: require('hapi-hpkp'),
      options: hpkpOptions
    });
  }

  var routes = require('../routing').routes;
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
      if (! route.config.payload) {
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
  server.events.on('log', function onServerLog(ev, tags) {
    if (tags.error && tags.implementation) {
      hapiLogger.critical('error.uncaught.server', ev.data);
    }
  });

  server.events.on('request', function onRequestLog(req, ev, tags) {
    if (tags.error && tags.implementation) {
      if (ev.data.stack.indexOf('hapi/lib/validation.js') !== -1) {
        hapiLogger.error('error.payload.validation', ev.data);
      } else {
        hapiLogger.critical('error.uncaught.request', ev.data);
      }
    }
  });

  // configure Sentry
  configureSentry(server, config);

  server.ext('onPreResponse', function onPreResponse(request, h) {
    var response = request.response;
    if (response.isBoom) {
      response = AppError.translate(response);
    }
    summary(request, response);

    return response;
  });

  server.ext('onPreAuth', function (request, h) {
    // Construct source-ip-address chain for logging.
    var xff = (request.headers['x-forwarded-for'] || '').split(/\s*,\s*/);
    xff.push(request.info.remoteAddress);
    // Remove empty items from the list, in case of badly-formed header.
    xff = xff.filter(function(x){
      return x;
    });
    // Skip over entries for our own infra, loadbalancers, etc.
    var clientAddressIndex = xff.length - (config.clientAddressDepth || 1);
    if (clientAddressIndex < 0) {
      clientAddressIndex = 0;
    }

    request.app.remoteAddressChain = xff;
    request.app.clientAddress = xff[clientAddressIndex];
    return h.continue;
  });

  return server;
};
