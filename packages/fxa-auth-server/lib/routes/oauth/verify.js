/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const token = require('../../oauth/token');
const validators = require('../../oauth/validators');

module.exports = ({ log }) => ({
  method: 'POST',
  path: '/verify',
  config: {
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        token: validators.accessToken.required(),
      }),
    },
    response: {
      schema: {
        user: Joi.string().required(),
        client_id: Joi.string().required(),
        scope: Joi.array(),
        generation: Joi.number().min(0),
        profile_changed_at: Joi.number().min(0),
      },
    },
    handler: async function verify(req) {
      const info = await token.verify(req.payload.token);
      info.scope = info.scope.getScopeValues();
      log.debug('verify.success', {
        client_id: info.client_id,
        scope: info.scope,
      });
      req.emitMetricsEvent('verify.success', {
        service: info.client_id,
        uid: info.user,
      });
      return info;
    },
  },
});
