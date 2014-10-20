/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const AppError = require('../error');
const config = require('../config').root();
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

// This is the webserver. It's what the outside always talks to. It
// handles the whole Profile API.
exports.create = function createServer() {
  var isProd = config.env === 'prod';
  var server = Hapi.createServer(
    config.server.host,
    config.server.port,
    {
      cors: true,
      debug: false,
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
  );

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
            token: token
          }
        }, function(err, resp, body) {
          if (err) {
            logger.error('auth', err);
            return reply(AppError.oauthError(err));
          }
          if (body.code >= 400) {
            logger.debug('unauthorized', body);
            return reply(AppError.unauthorized(body.message));
          }
          logger.debug('auth.valid', body);
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
    if (scopes.indexOf('profile') === -1) {
      scopes.push('profile');
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
