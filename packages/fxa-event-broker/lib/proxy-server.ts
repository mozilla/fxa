/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as hapi from '@hapi/hapi';
import { Logger } from 'mozlog';

import * as proxy from './api';
import { ClientWebhookService } from './selfUpdatingService/clientWebhookService';

export type ServerConfig = proxy.ProxyConfig & {
  port: number;
};

export async function init(
  config: ServerConfig,
  logger: Logger,
  webhookService: ClientWebhookService
): Promise<hapi.Server> {
  const server = new hapi.Server({
    debug: { request: ['error'] },
    port: config.port
  });

  proxy.init(logger, config, server, webhookService);

  return server;
}
