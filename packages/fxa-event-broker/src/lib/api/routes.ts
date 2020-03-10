/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Hapi routing for the proxy HTTP API.
 *
 * @module
 */
import hapi from '@hapi/hapi';
import hapiJoi from '@hapi/joi';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';

import { JWT } from '../jwts';
import { ClientWebhookService } from '../selfUpdatingService/clientWebhookService';
import ProxyController from './proxy-controller';
import { proxyPayloadValidator } from './proxy-validator';

/** Setup the proxy controller, its routes, and wire them into a Hapi server */
export default function(
  logger: Logger,
  metrics: StatsD,
  server: hapi.Server,
  jwt: JWT,
  webhookService: ClientWebhookService
) {
  const proxyController = new ProxyController(logger, metrics, webhookService, jwt);
  server.bind(proxyController);

  server.route([
    {
      handler: proxyController.heartbeat,
      method: 'GET',
      path: '/__lbheartbeat__'
    },
    {
      handler: proxyController.version,
      method: 'GET',
      path: '/__version__'
    },
    {
      method: 'POST',
      options: {
        auth: 'pubsub',
        handler: proxyController.proxyDelivery,
        validate: {
          payload: (proxyPayloadValidator as unknown) as hapiJoi.ObjectSchema
        }
      },
      path: '/v1/proxy/{clientId}'
    }
  ]);
}
