/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hapi from '@hapi/hapi';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';

import { apiInit, ProxyConfig } from './api';
import { ClientWebhookService } from './selfUpdatingService/clientWebhookService';

export type ServerEnvironment = 'production' | 'stage' | 'development';

export type ServerConfig = ProxyConfig & {
  env: ServerEnvironment;
  port: number;
};

export async function proxyServerInit(
  config: ServerConfig,
  logger: Logger,
  metrics: StatsD,
  webhookService: ClientWebhookService
): Promise<hapi.Server> {
  const server = new hapi.Server({
    debug: config.env === 'production' ? false : { request: ['error'] },
    port: config.port
  });

  apiInit(logger, metrics, config, server, webhookService);

  return server;
}
