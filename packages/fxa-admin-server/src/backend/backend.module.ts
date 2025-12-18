/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';

import { AuthClientFactory, AuthClientService } from './auth-client.service';
import { FirestoreFactory, FirestoreService } from './firestore.service';
import { CloudTasksFactory, CloudTasksService } from './cloud-tasks.service';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';
import { ProfileClient } from '@fxa/profile/client';
import { ProfileClientFactory } from './profile-client.service';
import {
  EmailSenderFactory,
  EmailService,
  FxaEmailRendererFactory,
  EmailLinkBuilderFactory,
  BouncesFactory,
} from './email.service';
import { DatabaseService } from '../database/database.service';

@Module({
  providers: [
    AuthClientFactory,
    FirestoreFactory,
    CloudTasksFactory,
    DatabaseService,
    MetricsFactory,
    ProfileClientFactory,
    EmailLinkBuilderFactory,
    FxaEmailRendererFactory,
    BouncesFactory,
    EmailSenderFactory,
    EmailService,
  ],
  exports: [
    AuthClientService,
    FirestoreService,
    CloudTasksService,
    DatabaseService,
    ProfileClient,
    EmailService,
  ],
})
export class BackendModule {}
