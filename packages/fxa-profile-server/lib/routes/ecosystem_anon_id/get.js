/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');

const logger = require('../../logging')('routes.ecosystem_anon_id.get');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:ecosystem_anon_id'],
  },
  response: {
    schema: {
      ecosystemAnonId: Joi.string().optional(),
    },
  },
  handler: async function ecosystemAnonIdGet(req, h) {
    const uid = req.auth.credentials.user;
    logger.info('activityEvent', { event: 'ecosystemAnonId.get', uid: uid });

    // Not implemented yet. Always return an empty 204 for now.
    return h.response({}).code(204);
  },
};
