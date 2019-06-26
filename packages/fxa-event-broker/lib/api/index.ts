/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Server } from '@hapi/hapi';
import { Logger } from 'mozlog';

import { JWT } from '../jwts';
import { ClientWebhookService } from '../selfUpdatingService/clientWebhookService';
import pubSubAuth from './pubsub-auth';
import Routes from './routes';

export type ProxyConfig = {
  pubsub: {
    audience: string;
    authenticate: boolean;
    verificationToken: string;
  };
  openid: {
    issuer: string;
    key: object;
  };
};

export function init(
  logger: Logger,
  config: ProxyConfig,
  server: Server,
  webhookService: ClientWebhookService
) {
  const jwt = new JWT(config.openid);
  server.auth.scheme('googlePubSub', pubSubAuth);
  server.auth.strategy('pubsub', 'googlePubSub', config.pubsub);
  Routes(logger, server, jwt, webhookService);
}
