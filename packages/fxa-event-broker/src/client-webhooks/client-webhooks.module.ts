/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';

import { FirestoreModule } from '../firestore/firestore.module';
import { FirestoreService } from '../firestore/firestore.service';
import { LoggerModule } from '../logger/logger.module';
import { ClientWebhooksService } from './client-webhooks.service';

@Module({
  imports: [FirestoreModule, LoggerModule],
  providers: [ClientWebhooksService, FirestoreService],
  exports: [ClientWebhooksService],
})
export class ClientWebhooksModule {}
