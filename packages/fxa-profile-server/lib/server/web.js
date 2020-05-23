/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('@hapi/hapi');
const Raven = require('raven');
const cloneDeep = require('lodash').cloneDeep;
const ScopeSet = require('fxa-shared').oauth.scopes;

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
exports.create = async function createServer() {
  var useRedis = config.serverCache.useRedis;
  var cacheProvider = {
    constructor: useRedis
      ? require('@hapi/catbox-redis')
      : require('@hapi/catbox-memory'),
    options: {},
  };
  if (useRedis) {
    cacheProvider.options.host = config.serverCache.redis.host;
    cacheProvider.options.port = config.serverCache.redis.port;
    cacheProvider.options.partition = config.serverCache.redis.keyPrefix;
  }
  var isProd = config.env === 'production';
  var server = new Hapi.Server({
    cache: {
      provider: cacheProvider,
    },
    debug: false,
    host: config.server.host,
    port: config.server.port,
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
      validate: {
        options: {
          stripUnknown: true,
        },
        failAction: async (request, h, err) => {
          // Starting with Hapi 17, the framework hides the validation info
          // We want the full validation information and use it in `onPreResponse` below

          // See: https://github.com/hapijs/hapi/issues/3706#issuecomment-349765943
          throw err;
        },
      },
    },
  });
  server.validator(require('@hapi/joi'));

  // configure Sentry
  const sentryDsn = config.sentryDsn;
  if (sentryDsn) {
    Raven.config(sentryDsn, {});
    server.events.on(
      { name: 'request', channels: 'error' },
      (request, event) => {
        const err = (event && event.error) || null;
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
      }
    );
  }

  server.auth.scheme('oauth', function () {
    return {
      authenticate: async function (req, h) {
        var auth = req.headers.authorization;
        var url = config.oauth.url + '/verify';
        logger.debug('auth', auth);
        if (!auth || auth.indexOf('Bearer') !== 0) {
          throw AppError.unauthorized('Bearer token not provided');
        }
        var token = auth.split(' ')[1];

        function makeReq() {
          return new Promise((resolve, reject) => {
            request.post(
              {
                url: url,
                json: {
                  token: token,
                },
              },
              function (err, resp, body) {
                if (err || resp.statusCode >= 500) {
                  err = err || resp.statusMessage || 'unknown';
                  logger.error('oauth.error', err);
                  return reject(AppError.oauthError(err));
                }
                if (body.code >= 400) {
                  logger.debug('unauthorized', body);
                  return reject(AppError.unauthorized(body.message));
                }
                logger.debug('auth.valid', body);
                body.token = token;
                return resolve(body);
              }
            );
          });
        }

        return makeReq().then((body) => {
          return h.authenticated({
            credentials: body,
          });
        });
      },
    };
  });

  server.auth.strategy('oauth', 'oauth');

  server.auth.scheme('secretBearerToken', function () {
    return {
      authenticate: async function (req, h) {
        // HACK: get fresh copy of secretBearerToken from config because tests change it.
        var expectedToken = require('../config').get('secretBearerToken');
        var auth = req.headers.authorization;
        logger.debug('auth', auth);
        if (!auth || auth.indexOf('Bearer') !== 0) {
          throw new AppError.unauthorized('Bearer token not provided');
        }
        var token = auth.split(' ')[1];
        if (token === expectedToken) {
          return h.authenticated({ credentials: token });
        } else {
          throw new AppError.unauthorized();
        }
      },
    };
  });

  server.auth.strategy('secretBearerToken', 'secretBearerToken');

  // server method for caching profile
  await server.register({
    plugin: {
      name: 'profileCache',
      version: '1.0.0',
      register: require('../profileCache'),
    },
    options: config.serverCache,
  });

  var routes = require('../routing');
  if (isProd) {
    logger.info('production', 'Disabling response schema validation');
    routes.forEach(function (route) {
      delete route.config.response;
    });
  }

  // Expand the scope list on each route to include all super-scopes,
  // so that Hapi can easily check them via simple string comparison.
  routes = routes
    .map(function (routeDefinition) {
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
    .map(function (route) {
      if (route.config.cache === undefined) {
        route.config.cache = {
          otherwise: 'private, no-cache, no-store, must-revalidate',
        };
      }
      return route;
    });

  await server.route(routes);

  server.ext('onPreAuth', function (request, h) {
    // Construct source-ip-address chain for logging.
    var xff = (request.headers['x-forwarded-for'] || '').split(/\s*,\s*/);
    xff.push(request.info.remoteAddress);
    // Remove empty items from the list, in case of badly-formed header.
    xff = xff.filter(function (x) {
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
    return h.continue;
  });

  server.ext('onPreResponse', (request) => {
    var response = request.response;
    if (response.isBoom) {
      response = AppError.translate(response);
    }
    summary(request, response);

    return response;
  });

  return server;
};
