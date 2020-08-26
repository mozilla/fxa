/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';

import { ClientCapabilityModule } from '../client-capability/client-capability.module';
import { FirestoreModule } from '../firestore/firestore.module';
import { GooglePubsubFactory } from '../google-pubsub.service';
import { LoggerModule } from '../logger/logger.module';
import { MetricsFactory } from '../metrics.service';
import { QueueworkerService } from './queueworker.service';

@Module({
  imports: [ClientCapabilityModule, FirestoreModule, LoggerModule],
  providers: [QueueworkerService, MetricsFactory, GooglePubsubFactory],
})
export class QueueworkerModule {}
