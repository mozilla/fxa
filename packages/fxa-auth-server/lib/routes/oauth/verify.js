/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MISC_DOCS from '../../../docs/swagger/misc-api';

const Joi = require('@hapi/joi');

const token = require('../../oauth/token');
const validators = require('../../oauth/validators');

module.exports = ({ log }) => ({
  method: 'POST',
  path: '/verify',
  config: {
    ...MISC_DOCS.VERIFY_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        token: validators.accessToken.required(),
      }).label('Verify_payload'),
    },
    response: {
      schema: Joi.object({
        user: Joi.string().required(),
        client_id: Joi.string().required(),
        scope: Joi.array(),
        generation: Joi.number().min(0),
        profile_changed_at: Joi.number().min(0),
      }).label('Verify_response'),
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
