/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const Raven = require('raven');
const cloneDeep = require('lodash.clonedeep');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;

const AppError = require('../error');
const config = require('../config').getProperties();
const logger = require('../logging')('server.web');
const request = require('../request');
const summary = require('../logging/summary');

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
  var useRedis = config.serverCache.useRedis;
  var cache = {
    engine: useRedis ? require('catbox-redis') : require('catbox-memory'),
  };
  if (useRedis) {
    cache.host = config.serverCache.redis.host;
    cache.port = config.serverCache.redis.port;
    cache.partition = config.serverCache.redis.keyPrefix;
  }
  var isProd = config.env === 'production';
  var server = new Hapi.Server({
    cache: cache,
    debug: false,
    connections: {
      routes: {
        cors: true,
        security: {
          hsts: {
            maxAge: 31536000,
            includeSubdomains: true,
          },
          xframe: true,
          xss: true,
          noOpen: false,
          noSniff: true,
        },
      },
    },
  });

  server.connection({
    host: config.server.host,
    port: config.server.port,
  });

  // configure Sentry
  const sentryDsn = config.sentryDsn;
  if (sentryDsn) {
    Raven.config(sentryDsn, {});
    server.on('request-error', function(request, err) {
      let exception = '';
      if (err && err.stack) {
        try {
          exception = err.stack.split('\n')[0];
        } catch (e) {
          // ignore bad stack frames
        }
      }

      Raven.captureException(err, {
        extra: {
          exception: exception,
        },
      });
    });
  }

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
        request.post(
          {
            url: url,
            json: {
              token: token,
              email: false, // disables email fetching of oauth server
            },
          },
          function(err, resp, body) {
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
              credentials: body,
            });
          }
        );
      },
    };
  });

  server.auth.strategy('oauth', 'oauth');

  server.auth.scheme('secretBearerToken', function() {
    return {
      authenticate: function(req, reply) {
        // HACK: get fresh copy of secretBearerToken from config because tests change it.
        var expectedToken = require('../config').get('secretBearerToken');
        var auth = req.headers.authorization;
        logger.debug('auth', auth);
        if (!auth || auth.indexOf('Bearer') !== 0) {
          return reply(AppError.unauthorized('Bearer token not provided'));
        }
        var token = auth.split(' ')[1];
        return token === expectedToken
          ? reply.continue({ credentials: token })
          : reply(AppError.unauthorized());
      },
    };
  });

  server.auth.strategy('secretBearerToken', 'secretBearerToken');

  // server method for caching profile
  server.register(
    {
      register: require('../profileCache'),
      options: config.serverCache,
    },
    function(err) {
      if (err) {
        throw err;
      }
    }
  );

  var routes = require('../routing');
  if (isProd) {
    logger.info('production', 'Disabling response schema validation');
    routes.forEach(function(route) {
      delete route.config.response;
    });
  }

  // Expand the scope list on each route to include all super-scopes,
  // so that Hapi can easily check them via simple string comparison.
  routes = routes
    .map(function(routeDefinition) {
      // create a copy of the route definition to avoid cross-unit test
      // contamination since we make local changes to the definition object.
      const route = cloneDeep(routeDefinition);
      var scope = route.config.auth && route.config.auth.scope;
      if (scope) {
        route.config.auth.scope = ScopeSet.fromArray(
          scope
        ).getImplicantValues();
      }
      return route;
    })
    .map(function(route) {
      if (route.config.cache === undefined) {
        route.config.cache = {
          otherwise: 'private, no-cache, no-store, must-revalidate',
        };
      }
      return route;
    });

  server.route(routes);

  server.ext('onPreAuth', function(request, reply) {
    // Construct source-ip-address chain for logging.
    var xff = (request.headers['x-forwarded-for'] || '').split(/\s*,\s*/);
    xff.push(request.info.remoteAddress);
    // Remove empty items from the list, in case of badly-formed header.
    xff = xff.filter(function(x) {
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
