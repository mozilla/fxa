/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');

const Hapi = require('hapi');
const Boom = Hapi.error;

const config = require('./config').root();
const logger = require('./logging').getLogger('fxa.server');

exports.create = function createServer() {
  var server = Hapi.createServer(
    config.server.host,
    config.server.port
  );

  server.auth.scheme('userid', function() {
    return {
      authenticate: function(request, reply) {
        var auth = request.headers.authorization;
        if (!auth || auth.indexOf('userid ') !== 0) {
          return reply(Boom.unauthorized('userid not provided'));
        }

        var id = auth.split(' ')[1];
        if (!id) {
          return reply(Boom.unauthorized('userid not provided'));
        }

        reply(null, {
          credentials: id
        });
      }
    };
  });

  server.auth.strategy('userid', 'userid');

  server.route(require('./routing'));

  server.pack.require('lout', function(err) {
    if (err) {
      throw err;
    }
  });


  server.on('request', function(req, evt, tags) {
    if (tags.error && util.isError(evt.data)) {
      var err = evt.data;
      if (err.isBoom && err.output.statusCode < 500) {
        // a 4xx error, so its not our fault. not an ERROR level log
        logger.warn('%d response: %s', err.output.statusCode, err.message);
      } else {
        logger.error('%s', err);
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
