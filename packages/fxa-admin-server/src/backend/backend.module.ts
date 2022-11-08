/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';

import { AuthClientFactory, AuthClientService } from './auth-client.service';
import { FirestoreFactory, FirestoreService } from './firestore.service';

@Module({
  providers: [AuthClientFactory, FirestoreFactory],
  exports: [AuthClientService, FirestoreService],
})
export class BackendModule {}
