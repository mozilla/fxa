/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');
const checksum = require('checksum');

const db = require('../../db');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:display_name'],
  },
  response: {
    schema: {
      displayName: Joi.string().max(256),
    },
  },
  handler: async function displayNameGet(req, h) {
    const result = await db.getDisplayName(req.auth.credentials.user);
    if (result && result.displayName) {
      return h
        .response({ displayName: result.displayName })
        .etag(checksum(result.displayName));
    } else {
      return h.response({}).code(204);
    }
  },
};
