/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const Joi = Hapi.types;

const AppError = require('../error');
const config = require('../config');
const db = require('../db');
const logger = require('../logging').getLogger('fxa.routes.request');

const HEX_STRING = /^[0-9a-f]+$/;


module.exports = {
  validate: {
    path: {
      id: Joi.string()
        .length(config.get('unique.id') * 2) // hex = bytes*2
        .regex(HEX_STRING)
        .required()
    }
  },
  response: {
    schema: {
      name: Joi.string().required(),
      imageUri: Joi.string().required()
    }
  },
  handler: function requestInfoEndpoint(req, reply) {
    var params = req.params;
    db.getClient(Buffer(params.id, 'hex')).then(function(client) {
      if (!client) {
        logger.debug('client:id="%s" not found', params.id);
        throw AppError.unknownClient(params.id);
      }
      return client;
    }).done(function(client) {
      reply({
        name: client.name,
        imageUri: client.imageUri
      });
    }, reply);
  }
};


