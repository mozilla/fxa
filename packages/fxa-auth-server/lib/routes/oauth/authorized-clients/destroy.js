/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Joi from 'joi';

import validators from '../../../oauth/validators';
import authorizedClients from '../../../oauth/authorized_clients';
import verifyAssertion from '../../../oauth/assertion';
import { default as DESCRIPTION } from '../../../../docs/swagger/shared/descriptions';
import { default as OAUTH_SERVER_DOCS } from '../../../../docs/swagger/oauth-server-api';

export default () => ({
  method: 'POST',
  path: '/authorized-clients/destroy',
  config: {
    ...OAUTH_SERVER_DOCS.AUTHORIZED_CLIENTS_DESTROY_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        client_id: validators.clientId.description(
          DESCRIPTION.clientId + DESCRIPTION.clientIdToDelete
        ),
        refresh_token_id: validators.token
          .optional()
          .description(DESCRIPTION.refreshTokenId),
        assertion: validators.assertion.description(DESCRIPTION.assertion),
      }),
    },
    handler: async function (req) {
      const claims = await verifyAssertion(req.payload.assertion);
      await authorizedClients.destroy(
        req.payload.client_id,
        claims.uid,
        req.payload.refresh_token_id
      );
      return {};
    },
  },
});
