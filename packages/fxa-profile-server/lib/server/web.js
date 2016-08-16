/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const AppError = require('../error');
const config = require('../config').getProperties();
const logger = require('../logging')('server.web');
const request = require('../request');
const summary = require('../logging/summary');

function set(arr) {
  var obj = Object.create(null);
  arr.forEach(function(name) {
    obj[name] = name;
  });
  return Object.keys(obj);
}

function trimLocale(header) {
  if (!header) {
    return header;
  }
  if (header.length < 256) {
    return header.trim();
  }
  var parts = header.split(',');
  var str = parts[0];
  if (str.length >= 255) {
    return null;
  }
  for (var i = 1; i < parts.length && str.length + parts[i].length < 255; i++) {
    str += ',' + parts[i];
  }
  return str.trim();
}

// This is the webserver. It's what the outside always talks to. It
// handles the whole Profile API.
exports.create = function createServer() {
  var isProd = config.env === 'prod';
  var server = new Hapi.Server({
    debug: false,
    connections: {
      routes: {
        cors: true,
        security: {
          hsts: {
            maxAge: 15552000,
            includeSubdomains: true
          },
          xframe: false,
          xss: false,
          noOpen: false,
          noSniff: false
        }
      }
    }
  });

  server.connection({
    host: config.server.host,
    port: config.server.port
  });

  server.auth.scheme('oauth', function() {
    return {
      authenticate: function(req, reply) {
        var auth = req.headers.authorization;
        var url = config.oauth.url + '/verify';
        logger.debug('auth', auth);
        if (!auth || auth.indexOf('Bearer') !== 0) {
          return reply(AppError.unauthorized('Bearer token not provided'));
        }
        var token = auth.split(' ')[1];
        request.post({
          url: url,
          json: {
            token: token,
            email: false // disables email fetching of oauth server
          }
        }, function(err, resp, body) {
          if (err || resp.statusCode >= 500) {
            err = err || resp.statusMessage || 'unknown';
            logger.error('oauth.error', err);
            return reply(AppError.oauthError(err));
          }
          if (body.code >= 400) {
            logger.debug('unauthorized', body);
            return reply(AppError.unauthorized(body.message));
          }
          logger.debug('auth.valid', body);
          body.token = token;
          reply.continue({
            credentials: body
          });
        });
      }
    };
  });

  server.auth.strategy('oauth', 'oauth');

  var routes = require('../routing');
  if (isProd) {
    logger.info('prod', 'Disabling response schema validation');
    routes.forEach(function(route) {
      delete route.config.response;
    });
  }
  // make sure all `read` scopes include `write`, and all include `profile`
  routes.forEach(function(route) {
    var scopes = route.config.auth && route.config.auth.scope;
    if (!scopes) {
      return;
    }
    var profileScope = route.method === 'GET' ? 'profile' : 'profile:write';
    if (scopes.indexOf(profileScope) === -1) {
      scopes.push(profileScope);
    }
    for (var i = 0, len = scopes.length; i < len; i++) {
      var scope = scopes[i];
      if (scope.indexOf(':write') === -1) {
        scopes.push(scope + ':write');
      }
    }
    scopes = set(scopes);
  });
  server.route(routes);

  server.ext('onPreAuth', function (request, reply) {
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

    request.app.acceptLanguage = trimLocale(request.headers['accept-language']);

    if (request.headers.authorization) {
      // Log some helpful details for debugging authentication problems.
      logger.debug('server.onPreAuth');
      logger.debug('rid', request.id);
      logger.debug('path', request.path);
      logger.debug('auth', request.headers.authorization);
      logger.debug('type', request.headers['content-type'] || '');
    }
    reply.continue();
  });

  server.ext('onPreResponse', function(request, next) {
    var response = request.response;
    if (response.isBoom) {
      response = AppError.translate(response);
    }
    summary(request, response);
    next(response);
  });

  return server;
};
