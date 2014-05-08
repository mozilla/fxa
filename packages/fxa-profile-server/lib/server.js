/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');

const Hapi = require('hapi');
const Boom = Hapi.error;

const config = require('./config').root();
const logger = require('./logging').getLogger('fxa.server');
const request = require('./request');

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
          return reply(Boom.unauthorized('Bearer token not provided'));
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
            return reply(Boom.unauthorized(body.message));
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

  server.on('request', function(req, evt, tags) {
    if (tags.error && util.isError(evt.data)) {
      var err = evt.data;
      if (err.isBoom && err.output.statusCode < 500) {
        // a 4xx error, so its not our fault. not an ERROR level log
        logger.warn('%d response: %s', err.output.statusCode, err.message);
      } else {
        logger.critical(err);
      }
    }
  });

  // response logging
  server.on('response', function(req) {
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
