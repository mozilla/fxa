/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';

import { ClientCapabilityModule } from '../client-capability/client-capability.module';
import { FirestoreModule } from '../firestore/firestore.module';
import { GooglePubsubFactory } from '../google-pubsub.service';
import { QueueworkerService } from './queueworker.service';

@Module({
  imports: [ClientCapabilityModule, FirestoreModule],
  providers: [QueueworkerService, MetricsFactory, GooglePubsubFactory],
})
export class QueueworkerModule {}
