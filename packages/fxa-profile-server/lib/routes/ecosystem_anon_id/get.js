/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');

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
    return req.server
      .inject({
        allowInternals: true,
        method: 'get',
        url: '/v1/_core_profile',
        headers: req.headers,
        auth: {
          credentials: req.auth.credentials,
          // As of Hapi 18: "To use the new format simply wrap the credentials and optional
          // artifacts with an auth object and add a new strategy key with a name matching
          // a configured authentication strategy."
          // Ref: https://github.com/hapijs/hapi/issues/3871
          strategy: 'oauth',
        },
      })
      .then(res => {
        if (res.statusCode !== 200) {
          return res;
        }
        if (res.result.ecosystemAnonId) {
          return {
            ecosystemAnonId: res.result.ecosystemAnonId,
          };
        } else {
          return h.response({}).code(204);
        }
      });
  },
};
