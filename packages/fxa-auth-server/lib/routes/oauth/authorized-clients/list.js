/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MISC_DOCS from '../../../../docs/swagger/misc-api';

const Joi = require('@hapi/joi');

const validators = require('../../../oauth/validators');
const verifyAssertion = require('../../../oauth/assertion');
const authorizedClients = require('../../../oauth/authorized_clients');

module.exports = () => ({
  method: 'POST',
  path: '/authorized-clients',
  config: {
    ...MISC_DOCS.AUTHORIZED_CLIENTS_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        assertion: validators.assertion.required(),
      }).label('AuthorizedClients_payload'),
    },
    response: {
      schema: Joi.array()
        .items(
          Joi.object({
            client_id: validators.clientId,
            refresh_token_id: validators.token.optional(),
            client_name: Joi.string().required(),
            created_time: Joi.number().min(0).required(),
            last_access_time: Joi.number().min(0).required().allow(null),
            scope: Joi.array().items(Joi.string()).required(),
          }).label('AuthorizedClient')
        )
        .label('AuthorizedClients_response'),
    },
    handler: async function (req) {
      const claims = await verifyAssertion(req.payload.assertion);
      return await authorizedClients.list(claims.uid);
    },
  },
});
