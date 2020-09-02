/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { ClientCapabilityService } from './client-capability.service';

@Module({
  imports: [LoggerModule],
  providers: [ClientCapabilityService],
  exports: [ClientCapabilityService],
})
export class ClientCapabilityModule {}
