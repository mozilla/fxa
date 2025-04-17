/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const DESCRIPTIONS =
  require('../../../docs/swagger/shared/descriptions').default;
const token = require('../../oauth/token');
const validators = require('../../oauth/validators');
const OAUTH_SERVER_DOCS =
  require('../../../docs/swagger/oauth-server-api').default;

module.exports = ({ log, glean }) => ({
  method: 'POST',
  path: '/verify',
  config: {
    ...OAUTH_SERVER_DOCS.VERIFY_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        token: validators.accessToken
          .required()
          .description(DESCRIPTIONS.token),
      }),
    },
    response: {
      schema: Joi.object({
        user: Joi.string().required().description(DESCRIPTIONS.user),
        client_id: Joi.string().required().description(DESCRIPTIONS.clientId),
        scope: Joi.array().description(DESCRIPTIONS.scope),
        generation: Joi.number().min(0),
        profile_changed_at: Joi.number().min(0),
      }),
    },
    handler: async function verify(req) {
      const info = await token.verify(req.payload.token);
      info.scope = info.scope.getScopeValues();

      console.log('!!! verify', req.payload, info);

      if (info.device_id) {
        // TODO: Lookup device id.
      }

      log.debug('verify.success', {
        client_id: info.client_id,
        scope: info.scope,
      });
      req.emitMetricsEvent('verify.success', {
        service: info.client_id,
        uid: info.user,
      });
      glean.oauth.tokenChecked(req, {
        uid: info.user,
        oauthClientId: info.client_id,
        scopes: info.scope,
      });

      return info;
    },
  },
});
