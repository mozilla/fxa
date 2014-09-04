/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');
const config = require('../config');
const db = require('../db');
const logger = require('../logging').getLogger('fxa.routes.request');

const HEX_STRING = /^[0-9a-f]+$/;


/*jshint camelcase: false*/
module.exports = {
  validate: {
    params: {
      client_id: Joi.string()
        .length(config.get('unique.id') * 2) // hex = bytes*2
        .regex(HEX_STRING)
        .required()
    }
  },
  response: {
    schema: {
      name: Joi.string().required(),
      image_uri: Joi.any(),
      redirect_uri: Joi.string().required()
    }
  },
  handler: function requestInfoEndpoint(req, reply) {
    var params = req.params;
    db.getClient(Buffer(params.client_id, 'hex')).then(function(client) {
      if (!client) {
        logger.debug('client:id="%s" not found', params.client_id);
        throw AppError.unknownClient(params.client_id);
      }
      return client;
    }).done(function(client) {
      reply({
        name: client.name,
        image_uri: client.imageUri,
        redirect_uri: client.redirectUri
      });
    }, reply);
  }
};
