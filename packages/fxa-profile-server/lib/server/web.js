/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const AppError = require('../error');
const config = require('../config').root();
const logger = require('../logging').getLogger('fxa.server.web');
const hapiLogger = require('../logging').getLogger('fxa.server.web.hapi');
const request = require('../request');
const summary = require('../logging/summary');

function set(arr) {
  var obj = Object.create(null);
  arr.forEach(function(name) {
    obj[name] = name;
  });
  return Object.keys(obj);
}

// This is the webserver. It's what the outside always talks to. It
// handles the whole Profile API.
exports.create = function createServer() {
  var isProd = config.env === 'prod';
  var server = Hapi.createServer(
    config.server.host,
    config.server.port,
    {
      cors: true,
      debug: false
    }
  );

  server.auth.scheme('oauth', function() {
    return {
      authenticate: function(req, reply) {
        var auth = req.headers.authorization;
        var url = config.oauth.url + '/verify';
        logger.debug('checking auth', auth);
        if (!auth || auth.indexOf('Bearer') !== 0) {
          return reply(AppError.unauthorized('Bearer token not provided'));
        }
        var token = auth.split(' ')[1];
        request.post({
          url: url,
          json: {
            token: token
          }
        }, function(err, resp, body) {
          if (err) {
            logger.error('auth verify error', err, body);
            return reply(err);
          }
          if (body.code >= 400) {
            logger.debug('unauthorized', body);
            return reply(AppError.unauthorized(body.message));
          }
          logger.debug('Token valid', body);
          reply(null, {
            credentials: body
          });
        });
      }
    };
  });

  server.auth.strategy('oauth', 'oauth');

  var routes = require('../routing');
  if (isProd) {
    logger.info('Disabling response schema validation');
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
    for (var i = 0, len = scopes.length; i < len; i++) {
      var scope = scopes[i];
      if (scope.indexOf(':write') === -1) {
        scopes.push(scope + ':write');
      }
    }
    scopes = set(scopes);
  });
  server.route(routes);

  // hapi internal logging: server and request
  server.on('log', function onServerLog(ev, tags) {
    if (tags.error && tags.implementation) {
      hapiLogger.critical('Uncaught internal error', ev.tags, ev.data);
    } else {
      hapiLogger.verbose('Server', ev.tags, ev.data);
    }
  });

  server.on('request', function onRequestLog(req, ev, tags) {
    if (tags.error && tags.implementation) {
      hapiLogger.critical('Uncaught internal error', ev.tags, ev.data);
    } else {
      hapiLogger.verbose('Request <%s>', req.id, ev.tags, ev.data);
    }
  });

  server.ext('onPreResponse', function(request, next) {
    var response = request.response;
    if (response.isBoom) {
      response = AppError.translate(response);
    }
    summary(request, response);
    next(response);
  });

  // response logging
  server.on('response', function onResponse(req) {
    logger.info(
      '%s %s - %d (%dms) <%s>',
      req.method.toUpperCase(),
      req.path,
      req.response.statusCode,
      Date.now() - req.info.received,
      req.id
    );
    logger.verbose('Response: %:2j <%s>', req.response.source, req.id);
  });

  return server;
};
