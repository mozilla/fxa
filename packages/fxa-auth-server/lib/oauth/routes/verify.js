/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');

const logger = require('../logging')('routes.verify');
const token = require('../token');
const validators = require('../validators');

const config = require('../../../config');
const amplitude = require('../metrics/amplitude')(
  logger,
  config.getProperties()
);

module.exports = {
  validate: {
    payload: {
      token: validators.accessToken.required(),
    },
  },
  response: {
    schema: {
      user: Joi.string().required(),
      client_id: Joi.string().required(),
      scope: Joi.array(),
      email: Joi.string(),
      profile_changed_at: Joi.number().min(0),
    },
  },
  handler: async function verify(req) {
    const info = await token.verify(req.payload.token);
    info.scope = info.scope.getScopeValues();
    delete info.email;
    logger.info('verify.success', {
      client_id: info.client_id,
      scope: info.scope,
    });
    amplitude('verify.success', {
      service: info.client_id,
      uid: info.user,
    });
    return info;
  },
};
