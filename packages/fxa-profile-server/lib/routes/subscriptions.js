/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:subscriptions'],
  },
  response: {
    schema: {
      subscriptions: Joi.array()
        .items(Joi.string())
        .required(),
    },
  },
  handler: function subscriptions(req, reply) {
    req.server.inject(
      {
        allowInternals: true,
        method: 'get',
        url: '/v1/_core_profile',
        headers: req.headers,
        credentials: req.auth.credentials,
      },
      res => {
        if (res.statusCode !== 200) {
          return reply(res);
        }
        return reply({
          // If auth server omits subscriptions, just use an empty list
          subscriptions: res.result.subscriptions || [],
        });
      }
    );
  },
};
