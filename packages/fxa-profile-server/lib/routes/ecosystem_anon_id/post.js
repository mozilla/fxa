/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
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
  handler: async function ecosystemAnonIdPost(req, h) {
    const uid = req.auth.credentials.user;
    logger.info('activityEvent', { event: 'ecosystemAnonId.post', uid: uid });

    // In production, we plan to store the `ecosystemAnonId` field in the auth-server db
    // and would need to write it back there in this code.
    // For initial dev purposes, we instead hackily store it in the local filesystem.
    // The way we implement `If-None-Match` here is not safe against races, but
    // should be good enough for development purposes.
    const filenm = `/tmp/profile.${uid}.json`;
    if (req.headers['if-none-match'] === '*' && fs.existsSync(filenm)) {
      return h.response({}).code(412);
    }
    fs.writeFileSync(filenm, JSON.stringify(req.payload));

    await req.server.methods.profileCache.drop(uid);
    notifyProfileUpdated(uid);
    return {};
  },
};
