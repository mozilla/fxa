/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as hapi from '@hapi/hapi';
import * as hapiJoi from '@hapi/joi';
import { Logger } from 'mozlog';

import { JWT } from '../jwts';
import { ClientWebhookService } from '../selfUpdatingService/clientWebhookService';
import ProxyController from './proxy-controller';
import { proxyPayloadValidator } from './proxy-validator';

export default function(
  logger: Logger,
  server: hapi.Server,
  jwt: JWT,
  webhookService: ClientWebhookService
) {
  const proxyController = new ProxyController(logger, webhookService, jwt);
  server.bind(proxyController);

  server.route({
    method: 'POST',
    options: {
      auth: 'pubsub',
      handler: proxyController.proxyDelivery,
      validate: {
        payload: proxyPayloadValidator as hapiJoi.ObjectSchema
      }
    },
    path: '/v1/proxy/{clientId}'
  });
}
