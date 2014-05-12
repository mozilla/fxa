/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const AppError = require('./error');
const config = require('./config').root();
const logger = require('./logging').getLogger('fxa.server');
const request = require('./request');
const summary = require('./logging/summary');

exports.create = function createServer() {
  var server = Hapi.createServer(
    config.server.host,
    config.server.port,
    {
      debug: false
    }
  );

  server.auth.scheme('oauth', function() {
    return {
      authenticate: function(req, reply) {
        var auth = req.headers.authorization;
        var url = config.oauth.url + '/verify';
        logger.verbose('checking auth', auth);
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
          logger.verbose('Token valid', body);
          reply(null, {
            credentials: body
          });
        });
      }
    };
  });

  server.auth.strategy('oauth', 'oauth');

  server.route(require('./routing'));

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
      '%s %s - %d (%dms)',
      req.method.toUpperCase(),
      req.path,
      req.response.statusCode,
      Date.now() - req.info.received
    );
  });

  return server;
};
