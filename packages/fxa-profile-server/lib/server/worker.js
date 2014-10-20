/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const Joi = require('joi');

const AppError = require('../error');
const compute = require('../compute');
const config = require('../config').root();
const logger = require('../logging')('server.worker');

exports.create = function() {
  var server = Hapi.createServer(
    config.worker.host,
    config.worker.port,
    {
      debug: false
    }
  );

  server.route({
    method: 'GET',
    path: '/__heartbeat__',
    config: {
      handler: function upload(req, reply) {
        reply({});
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/a/{id}',
    config: {
      validate: {
        headers: Joi.object({
          'content-length': Joi.number().required()
        }).unknown()
      },
      payload: {
        output: 'stream',
        parse: false,
        allow: ['image/png', 'image/jpeg']
      },
      handler: function upload(req, reply) {
        logger.debug('Worker received %d bytes', req.headers['content-length']);
        compute.image(req.params.id, req.payload).done(reply, reply);
      }
    }
  });

  server.ext('onPreResponse', function(request, next) {
    var response = request.response;
    if (response.isBoom) {
      response = AppError.translate(response);
    }
    next(response);
  });

  return server;
};

