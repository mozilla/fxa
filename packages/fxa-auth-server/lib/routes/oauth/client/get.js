/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hexModule from "buf";

const hex = hexModule.to.hex;
import Joi from 'joi';
import AppError from '../../../oauth/error';
import validators from '../../../oauth/validators';
import { default as DESCRIPTION } from '../../../../docs/swagger/shared/descriptions';
import { default as OAUTH_SERVER_DOCS } from '../../../../docs/swagger/oauth-server-api';

export default ({ log, oauthDB }) => ({
  method: 'GET',
  path: '/client/{client_id}',
  config: {
    ...OAUTH_SERVER_DOCS.CLIENT_CLIENTID_GET,
    cors: { origin: 'ignore' },
    validate: {
      params: {
        client_id: validators.clientId
          .required()
          .description(DESCRIPTION.clientId + DESCRIPTION.clientIdPermission),
      },
    },
    response: {
      schema: Joi.object({
        id: validators.clientId.description(
          DESCRIPTION.clientId + DESCRIPTION.clientIdPermission
        ),
        name: Joi.string().required().description(DESCRIPTION.name),
        trusted: Joi.boolean().required().description(DESCRIPTION.trusted),
        image_uri: Joi.any().description(DESCRIPTION.imageUri),
        redirect_uri: Joi.string()
          .required()
          .allow('')
          .description(DESCRIPTION.redirectUri),
      }),
    },
    handler: async function requestInfoEndpoint(req) {
      const params = req.params;

      return oauthDB
        .getClient(Buffer.from(params.client_id, 'hex'))
        .then(function (client) {
          if (!client) {
            log.debug('notFound', { id: params.client_id });
            throw AppError.unknownClient(params.client_id);
          } else {
            return {
              id: hex(client.id),
              name: client.name,
              trusted: client.trusted,
              image_uri: client.imageUri,
              redirect_uri: client.redirectUri,
            };
          }
        });
    },
  },
});
