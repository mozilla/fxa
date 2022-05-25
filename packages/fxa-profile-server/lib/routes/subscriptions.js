/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');
const {
  determineClientVisibleSubscriptionCapabilities,
} = require('../subscriptions');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:subscriptions'],
  },
  response: {
    schema: {
      subscriptions: Joi.array().items(Joi.string()).required(),
    },
  },
  handler: async function subscriptions(req) {
    const res = await req.server.inject({
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
    });

    if (res.statusCode !== 200) {
      return res;
    }
    let subscriptions = [];
    if (res.result.subscriptionsByClientId) {
      subscriptions = determineClientVisibleSubscriptionCapabilities(
        req.auth.credentials.client_id,
        res.result.subscriptionsByClientId
      );
    } else if (res.result.subscriptions) {
      subscriptions = res.result.subscriptions;
    }
    return {
      // If auth server omits subscriptions, just use an empty list
      subscriptions,
    };
  },
};
