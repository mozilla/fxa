/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Joi from 'joi';

import { default as DESCRIPTIONS } from '../../../docs/swagger/shared/descriptions';
import token from '../../oauth/token';
import validators from '../../oauth/validators';
import { default as OAUTH_SERVER_DOCS } from '../../../docs/swagger/oauth-server-api';

export default ({ log, glean }) => ({
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
      });
      return info;
    },
  },
});
