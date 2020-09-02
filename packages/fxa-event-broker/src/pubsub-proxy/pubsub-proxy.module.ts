/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';

import { ClientWebhooksModule } from '../client-webhooks/client-webhooks.module';
import { JwtsetModule } from '../jwtset/jwtset.module';
import { LoggerModule } from '../logger/logger.module';
import { MetricsFactory } from '../metrics.service';
import { PubsubProxyController } from './pubsub-proxy.controller';

@Module({
  imports: [ClientWebhooksModule, JwtsetModule, LoggerModule],
  controllers: [PubsubProxyController],
  providers: [MetricsFactory],
})
export class PubsubProxyModule {}
