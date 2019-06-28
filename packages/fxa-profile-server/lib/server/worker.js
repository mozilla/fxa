/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const Joi = require('joi');
const P = require('../promise');

const AppError = require('../error');
const compute = require('../compute');
const config = require('../config').getProperties();
const img = require('../img');
const logger = require('../logging')('server.worker');

const SIZES = img.SIZES;

exports.create = function() {
  var server = new Hapi.Server({
    debug: false,
  });

  server.connection({
    host: config.worker.host,
    port: config.worker.port,
  });

  server.route({
    method: 'GET',
    path: '/__heartbeat__',
    config: {
      handler: function upload(req, reply) {
        reply({});
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/a/{id}',
    config: {
      validate: {
        headers: Joi.object({
          'content-length': Joi.number().required(),
        }).unknown(),
      },
      payload: {
        output: 'stream',
        parse: false,
        allow: ['image/png', 'image/jpeg'],
        maxBytes: config.img.uploads.maxSize,
      },
      handler: function upload(req, reply) {
        logger.debug('worker.receive', {
          contentLength: req.headers['content-length'],
        });
        compute.image(req.params.id, req.payload).done(reply, reply);
      },
    },
  });

  server.route({
    method: 'DELETE',
    path: '/a/{id}',
    config: {
      handler: function delete_(req, reply) {
        P.all(
          Object.keys(SIZES).map(function(name) {
            if (name === 'default') {
              return req.params.id;
            }
            return req.params.id + '_' + name;
          })
        )
          .map(img.delete)
          .done(reply, reply);
      },
    },
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
