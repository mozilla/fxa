/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { LegacyMetricsProvider } from '@fxa/shared/metrics/statsd';

import { ClientCapabilityModule } from '../client-capability/client-capability.module';
import { FirestoreModule } from '../firestore/firestore.module';
import { GooglePubsubFactory } from '../google-pubsub.service';
import { QueueworkerService } from './queueworker.service';
import { ClientWebhooksModule } from '../client-webhooks/client-webhooks.module';

@Module({
  imports: [ClientCapabilityModule, ClientWebhooksModule, FirestoreModule],
  providers: [QueueworkerService, LegacyMetricsProvider, GooglePubsubFactory],
})
export class QueueworkerModule {}
