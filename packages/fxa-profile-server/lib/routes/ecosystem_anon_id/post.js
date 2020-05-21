/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');

const logger = require('../../logging')('routes.ecosystem_anon_id.post');
const notifyProfileUpdated = require('../../updates-queue');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:ecosystem_anon_id:write'],
  },
  validate: {
    payload: {
      ecosystemAnonId: Joi.string().required(),
    },
  },
  handler: async function ecosystemAnonIdPost(req) {
    const uid = req.auth.credentials.user;
    logger.info('activityEvent', { event: 'ecosystemAnonId.post', uid: uid });

    await req.server.methods.profileCache.drop(uid);

    // When DB is ready, insert/update req.payload.ecosystemAnonId.
    // For now, just notify and return.
    notifyProfileUpdated(uid);
    return {};
  },
};
